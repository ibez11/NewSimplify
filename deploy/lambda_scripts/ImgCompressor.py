from flask import Flask, request, jsonify
from PIL import Image
import pyheif
from io import BytesIO
import boto3
import os
import imghdr
import time
from datetime import datetime, timedelta

app = Flask(__name__)

# your existing functions go here
def is_recently_resized(bucket_name, object_key):
    recently_resized_file = "recently_resized_images.txt"

    if os.path.exists(recently_resized_file):
        with open(recently_resized_file, "r") as file:
            recently_resized_objects = file.read().splitlines()

        # Check if the object_key is in the recently resized list and modified in the last week
        for line in recently_resized_objects:
            if "," in line:  # Add this check to ensure there is a comma in the line
                obj_key, modified_timestamp = line.split(",")
                if obj_key == f"{bucket_name}/{object_key}" and time.time() - float(modified_timestamp) <= 604800:
                    return True

    return False

def mark_as_recently_resized(bucket_name, object_key):
    recently_resized_file = "recently_resized_images.txt"

    # Append the information about the resized image to the file
    with open(recently_resized_file, "a") as file:
        file.write(f"{bucket_name}/{object_key},{time.time()}\n")

# List of allowed image extensions
image_extensions = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".heic", ".heif"}

def get_image_format(image_data):
    # Use imghdr to determine the image format based on its content
    return imghdr.what(None, h=image_data)

def is_allowed_extension(file_name):
    # Determine whether the file extension is allowed
    print(image_extensions)
    return any(file_name.lower().endswith(ext) for ext in image_extensions)

def is_recently_modified(last_modified, days_ago=3):
    # Convert last_modified to timezone-naive
    last_modified = last_modified.replace(tzinfo=None)

    # Determine whether the file was modified in the last three days
    threshold = datetime.now() - timedelta(days=days_ago)
    return last_modified > threshold

def resize_image(image_data, quality=1, object_key=None):
    try:
        image = Image.open(BytesIO(image_data))

        # Convert RGB to sRGB
        image_srgb = image.convert("RGB")

        output_buffer = BytesIO()

        # Determine the image format from the image content
        image_format = get_image_format(image_data)

        # Handle image formats that cannot be converted to JPEG
        if image_format and image_format.lower() not in ["png", "jpg", "jpeg", "webp", "gif", "bmp", "heic", "heif"]:
            print(f"Image format {image_format} cannot be converted to JPEG.")
            return None, None

        # Check if the image is in HEIC format and use pyheif for conversion
        if image_format.lower() in ["heic", "heif"]:
            heif_image = pyheif.read_heif_image(BytesIO(image_data))
            image_srgb = Image.frombytes(
                heif_image.mode,
                heif_image.size,
                heif_image.data,
                "raw",
                heif_image.mode,
                heif_image.stride,
            )

        image_srgb.save(output_buffer, format=image_format, quality=quality, optimize=True)
    except Exception as e:
        print(f"Error while saving the image: {e}")
        return None, None

    return output_buffer.getvalue(), image_format

def modify_directory_structure(object_key):
    # Split directory and file name
    parts = object_key.split('/')

    # Replace the directory with "_resized"
    modified_parts = parts[:-2] + [f"{parts[-2]}_resized"] + parts[-1:]

    # Join the results back
    modified_object_key = '/'.join(modified_parts)

    return modified_object_key

def process_images_in_prefix(bucket_name, object_key=None, quality=1):
    # Configure AWS S3
    s3 = boto3.client('s3')

    # Check if the file extension is allowed
    if is_allowed_extension(object_key):
        try:
            # Get the image from the S3 bucket
            response = s3.get_object(Bucket=bucket_name, Key=object_key)
            image_data = response['Body'].read()

            # Call resize_image with object_key
            resized_image_data, image_format = resize_image(image_data, quality=quality, object_key=object_key)

            if resized_image_data is not None and image_format is not None:
                # new_object_key = f"{object_key.split('.')[0]}_resized.{image_format}"
                new_object_key = modify_directory_structure(object_key)

                # Mark the image as recently resized
                mark_as_recently_resized(bucket_name, object_key)

                # Save the resized image back to the S3 bucket
                s3.put_object(Body=resized_image_data, Bucket=bucket_name, Key=new_object_key, ContentType=f"image/{image_format}")
                print(f"Resized image saved to: s3://{bucket_name}/{new_object_key}")
        except Exception as e:
            print(f"Error while saving the image: {e}")
            return None
    else:
        print(f"File {object_key} is not in an allowed image format.")


@app.route('/process_images', methods=['POST'])
def process_images():
    data = request.get_json()
    print(data)
    s3 = boto3.client('s3')

    # Extract parameters from the JSON request
    bucket_name = "s3-simplify-prd-assets"
    object_keys = data['object_keys']
    quality = 5

    if 'object_keys' not in data:
        return jsonify({'error': 'Missing required parameter object_keys'}), 400

    # Process images
    for object_key in object_keys:
        new_object_key = object_key.replace("jobs", "jobs_resized")

        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=object_key)

        if not 'Contents' in response:
            print(f"Object with key '{object_key}' does not exist in bucket '{bucket_name}'.")
            continue

        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=new_object_key)
        # if not is_recently_resized(bucket_name, object_key):

        if not 'Contents' in response:
            print("process compress")
            process_images_in_prefix(bucket_name, object_key, quality=quality)

    return jsonify({'message': 'Image processing started successfully'}), 200

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)