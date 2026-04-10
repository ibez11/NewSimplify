--
-- Query for create new District table
--
DO
	$$ DECLARE
	r record;
BEGIN
		FOR r IN SELECT LOWER
		( KEY ) AS NAME 
	FROM
		"shared"."Tenant"
		LOOP
	IF
		( SELECT EXISTS ( SELECT 1 FROM information_schema.schemata WHERE SCHEMA_NAME = r.NAME ) ) THEN
			EXECUTE'CREATE TABLE ' || r.NAME || '."District" (
			"id" integer NOT NULL,
			"postalDistrict" varchar(10),
			"postalSector" varchar(250)[],
			"generalLocation" varchar(255)[]
			);
		
		CREATE SEQUENCE ' || r.NAME || '."District_id_seq" AS INTEGER START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
		ALTER TABLE ' || r.NAME || '."District_id_seq" OWNER TO simplify;
		ALTER SEQUENCE ' || r.NAME || '."District_id_seq" OWNED BY ' || r.NAME || '."District"."id";
		ALTER TABLE ONLY  ' || r.NAME || '."District" ALTER COLUMN "id" SET DEFAULT nextval(''' || r.NAME || '."District_id_seq"''::regclass);
		ALTER TABLE ONLY  ' || r.NAME || '."District" ADD CONSTRAINT "District_pkey" PRIMARY KEY (id);
		COMMENT ON TABLE ' || r.NAME || '."District" IS ''Distric area of singapore.'';
		
		INSERT INTO ' || r.NAME || '."District" ("postalDistrict", "postalSector", "generalLocation") VALUES
		(''01'', ''{01, 02, 03, 04, 05, 06}'', ''{Raffles Place, Cecil, Marina, Peoples Park}''),
		(''02'', ''{07, 08}'', ''{Anson, Tanjong Pagar}''),
		(''03'', ''{14, 15, 16}'', ''{Queenstown, Tiong Bahru}''),
		(''04'', ''{09, 10}'', ''{Telok Blangah, Harbourfront}''),
		(''05'', ''{11, 12, 13}'', ''{Pasir Panjang, Hong Leong Garden, Clementi New Town}''),
		(''06'', ''{17}'', ''{High Street, Beach Road (part)}''),
		(''07'', ''{18, 19}'', ''{Middle Road, Golden Mile}''),
		(''08'', ''{20, 21}'', ''{Little India}''),
		(''09'', ''{22, 23}'', ''{Orchard, Cairnhill, River Valley}''),
		(''10'', ''{24, 25, 26, 27}'', ''{Ardmore, Bukit Timah, Holland Road, Tanglin}''),
		(''11'', ''{28, 29, 30}'', ''{Watten Estate, Novena, Thomson}''),
		(''12'', ''{31, 32, 33}'', ''{Balestier, Toa Payoh, Serangoon}''),
		(''13'', ''{34, 35, 36, 37}'', ''{Macpherson, Braddell}''),
		(''14'', ''{38, 39, 40, 41}'', ''{Geylang, Eunos}''),
		(''15'', ''{42, 43, 44, 45}'', ''{Katong, Joo Chiat, Amber Road}''),
		(''16'', ''{46, 47, 48}'', ''{Bedok, Upper East Coast, Eastwood, Kew Drive}''),
		(''17'', ''{49, 50, 81}'', ''{Loyang, Changi}''),
		(''18'', ''{51, 52}'', ''{Tampines, Pasir Ris}''),
		(''19'', ''{53, 54, 55, 82}'', ''{Serangoon Garden, Hougang, Punggol}''),
		(''20'', ''{56, 57}'', ''{Bishan, Ang Mo Kio}''),
		(''21'', ''{58, 59}'', ''{Upper Bukit Timah, Clementi Park, Ulu Pandan}''),
		(''22'', ''{60, 61, 62, 63, 64}'', ''{Jurong}''),
		(''23'', ''{65, 66, 67, 68}'', ''{Hillview, Dairy Farm, Bukit Panjang, Choa Chu Kang}''),
		(''24'', ''{69, 70, 71}'', ''{Lim Chu Kang, Tengah}''),
		(''25'', ''{72, 73}'', ''{Kranji, Woodgrove}''),
		(''26'', ''{77, 78}'', ''{Upper Thomson, Springleaf}''),
		(''27'', ''{75, 76}'', ''{Yishun, Sembawang}''),
		(''28'', ''{79, 80}'', ''{Seletar}'');
		
		INSERT INTO ' || r.NAME || '."Permission" VALUES 
		(162, ''DISTRICT'', ''ACCESS''),
		(163, ''DISTRICT'', ''VIEW'');
		INSERT INTO ' || r.NAME || '."RolePermission" ("roleId", "permissionId") VALUES
		(1, 162),
		(1, 163);';
		
	END IF;
	
END LOOP;

END $$;