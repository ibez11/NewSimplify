--
-- Query for insert new wa template
--

INSERT INTO "shared"."WaTemplate" ("id", "name", "messageBody", "isActive")
VALUES
('4', 'job_customer_booking', 
'You have a service appointment with *{1}* for *{2}* in *{3}*. 👉 Please click this link to choose your preferred time slot, link: {4}. Please contact *{1}* at *{5}* if you have any questions.', true);  