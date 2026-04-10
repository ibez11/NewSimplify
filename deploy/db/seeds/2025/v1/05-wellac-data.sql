--
-- PostgreSQL database dump
--

-- Dumped from database version 11.3 (Debian 11.3-1.pgdg90+1)
-- Dumped by pg_dump version 11.3 (Debian 11.3-1.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;



--
-- Data for Name: Role; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."Role" (id, name, "createdAt", "updatedAt") VALUES (1, 'ADMIN', '2019-06-12 23:48:25.187+08', '2019-06-12 23:48:28.754+08');
INSERT INTO wellac."Role" (id, name, "createdAt", "updatedAt") VALUES (2, 'TECHNICIAN', '2019-09-18 18:15:12+08', '2019-09-18 18:15:16+08');



--
-- Data for Name: UserProfile; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."UserProfile" (id, "displayName", email, "contactNumber", "token", "createdAt", "updatedAt") VALUES (1, 'Toon Pang', 'admin@wellac.com', '12345678', NULL, '2019-06-12 00:13:13.426+08', '2019-06-12 00:13:15.843+08');
INSERT INTO wellac."UserProfile" (id, "displayName", email, "contactNumber", "token", "createdAt", "updatedAt") VALUES (2, 'Employee 01', 'employee01@wellac.com', '6590000111', NULL, '2019-06-12 00:13:13.426+08', '2019-06-12 00:13:15.843+08');
INSERT INTO wellac."UserProfile" (id, "displayName", email, "contactNumber", "token", "createdAt", "updatedAt") VALUES (3, 'Employee 02', 'employee02@wellac.com', '6590000222', NULL, '2019-06-12 00:13:13.426+08', '2019-06-12 00:13:15.843+08');
INSERT INTO wellac."UserProfile" (id, "displayName", email, "contactNumber", "token", "createdAt", "updatedAt") VALUES (4, 'Employee 03', 'employee03@wellac.com', '6590000333', NULL, '2019-06-12 00:13:13.426+08', '2019-06-12 00:13:15.843+08');
INSERT INTO wellac."UserProfile" (id, "displayName", email, "contactNumber", "token", "createdAt", "updatedAt") VALUES (5, 'Employee 04', 'employee04@wellac.com', '6590000444', NULL, '2019-06-12 00:13:13.426+08', '2019-06-12 00:13:15.843+08');
INSERT INTO wellac."UserProfile" (id, "displayName", email, "contactNumber", "token", "createdAt", "updatedAt") VALUES (6, 'Employee 05', 'employee05@wellac.com', '6590000555', NULL, '2019-06-12 00:13:13.426+08', '2019-06-12 00:13:15.843+08');



--
-- Data for Name: UserProfileRole; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."UserProfileRole" ("createdAt", "updatedAt", "userProfileId", "roleId") VALUES ('2019-06-12 23:49:35.642+08', '2019-06-12 23:49:38.781+08', 1, 1);
INSERT INTO wellac."UserProfileRole" ("createdAt", "updatedAt", "userProfileId", "roleId") VALUES ('2019-09-16 14:59:47.577+08', '2019-09-16 14:59:47.577+08', 2, 1);
INSERT INTO wellac."UserProfileRole" ("createdAt", "updatedAt", "userProfileId", "roleId") VALUES ('2019-09-16 14:59:47.577+08', '2019-09-16 14:59:47.577+08', 3, 1);
INSERT INTO wellac."UserProfileRole" ("createdAt", "updatedAt", "userProfileId", "roleId") VALUES ('2019-09-16 14:59:47.577+08', '2019-09-16 14:59:47.577+08', 4, 1);
INSERT INTO wellac."UserProfileRole" ("createdAt", "updatedAt", "userProfileId", "roleId") VALUES ('2019-09-16 14:59:47.577+08', '2019-09-16 14:59:47.577+08', 5, 2);
INSERT INTO wellac."UserProfileRole" ("createdAt", "updatedAt", "userProfileId", "roleId") VALUES ('2019-09-16 14:59:47.577+08', '2019-09-16 14:59:47.577+08', 6, 2);



--
-- Data for Name: Permission; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (1, 'ADMINISTRATION', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (2, 'USERS', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (3, 'USERS', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (4, 'USERS', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (5, 'USERS', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (6, 'USERS', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (7, 'SERVICE_ITEM_TEMPLATES', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (8, 'SERVICE_ITEM_TEMPLATES', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (9, 'SERVICE_ITEM_TEMPLATES', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (10, 'SERVICE_ITEM_TEMPLATES', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (11, 'SERVICE_ITEM_TEMPLATES', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (12, 'CLIENTS', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (13, 'CLIENTS', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (14, 'CLIENTS', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (15, 'CLIENTS', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (16, 'CLIENTS', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (17, 'VEHICLES', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (18, 'VEHICLES', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (19, 'VEHICLES', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (20, 'VEHICLES', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (21, 'VEHICLES', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (22, 'SERVICES', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (23, 'SERVICES', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (24, 'SERVICES', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (25, 'SERVICES', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (26, 'SERVICES', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (27, 'ENTITIES', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (28, 'ENTITIES', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (29, 'ENTITIES', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (30, 'ENTITIES', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (31, 'ENTITIES', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (32, 'JOBS', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (33, 'JOBS', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (34, 'JOBS', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (35, 'JOBS', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (36, 'JOBS', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (37, 'SERVICES_ADDRESSES', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (38, 'SERVICES_ADDRESSES', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (39, 'SERVICES_ADDRESSES', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (40, 'SERVICES_ADDRESSES', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (41, 'SERVICES_ADDRESSES', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (42, 'SERVICES_ITEMS', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (43, 'SERVICES_ITEMS', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (44, 'SERVICES_ITEMS', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (45, 'SERVICES_ITEMS', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (46, 'SERVICES_ITEMS', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (47, 'JOB_NOTES', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (48, 'JOB_NOTES', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (49, 'JOB_NOTES', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (50, 'JOB_NOTES', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (51, 'JOB_NOTES', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (52, 'INVOICES', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (53, 'INVOICES', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (54, 'INVOICES', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (55, 'INVOICES', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (56, 'INVOICES', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (57, 'SERVICE_TEMPLATES', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (58, 'SERVICE_TEMPLATES', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (59, 'SERVICE_TEMPLATES', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (60, 'SERVICE_TEMPLATES', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (61, 'SERVICE_TEMPLATES', 'DELETE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (62, 'SETTING', 'ACCESS');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (63, 'SETTING', 'VIEW');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (64, 'SETTING', 'CREATE');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (65, 'SETTING', 'EDIT');
INSERT INTO wellac."Permission" (id, module, "accessLevel") VALUES (66, 'SETTING', 'DELETE');




--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 1);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 2);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 3);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 4);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 5);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 6);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 7);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 8);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 9);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 10);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 11);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 12);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 13);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 14);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 15);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 16);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 17);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 18);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 19);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 20);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 21);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 22);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 23);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 24);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 25);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 26);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 27);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 28);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 29);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 30);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 31);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 32);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 33);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 34);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 35);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 36);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 37);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 38);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 39);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 40);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 41);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 42);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 43);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 44);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 45);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 46);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 47);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 48);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 49);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 50);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 51);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 52);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 53);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 54);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 55);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 56);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 57);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 58);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 59);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 60);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 61);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 62);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 63);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 64);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 65);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (1, 66);

INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 1);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 2);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 3);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 5);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 7);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 8);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 12);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 13);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 17);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 18);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 22);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 23);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 24);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 32);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 33);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 35);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 37);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 38);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 42);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 43);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 47);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 48);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 49);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 50);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 51);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 52);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 53);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 57);
INSERT INTO wellac."RolePermission" ("roleId", "permissionId") VALUES (2, 58);



--
-- Data for Name: ServiceItemTemplate; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."ServiceItemTemplate" VALUES (1, 'General Chemical Service for', '', 0, NULL, NULL, '2019-09-02 13:45:09.101+08', '2019-09-02 13:45:09.101+08');
INSERT INTO wellac."ServiceItemTemplate" VALUES (2, 'Fully Chemical Overhaul FCU without dismantle for BTU ( )', '', 0, NULL, NULL, '2019-09-02 13:45:18.57+08', '2019-09-02 13:45:18.57+08');
INSERT INTO wellac."ServiceItemTemplate" VALUES (3, 'Top up R22 gas', '', 0, NULL, NULL, '2019-09-02 13:45:30.967+08', '2019-09-02 13:45:30.967+08');
INSERT INTO wellac."ServiceItemTemplate" VALUES (4, 'General Chemical 2-In1 + Anti-bacterial servicing + Steaming for', '', 0, NULL, NULL, '2019-09-14 01:40:17.852+08', '2019-09-14 01:40:17.852+08');
INSERT INTO wellac."ServiceItemTemplate" VALUES (5, 'Replacement of Fan Coil PCB', '', 0, NULL, NULL, '2019-09-14 01:40:29.902+08', '2019-09-14 01:40:29.902+08');
INSERT INTO wellac."ServiceItemTemplate" VALUES (6, 'Replacement of Expansion Valve (Coil + Body)', '', 0, NULL, NULL, '2019-09-14 01:40:39.697+08', '2019-09-14 01:40:39.697+08');
INSERT INTO wellac."ServiceItemTemplate" VALUES (7, 'Replacement of Outdoor Condensing Unit Fan Motor', '', 0, NULL, NULL, '2019-09-14 01:40:47.704+08', '2019-09-14 01:40:47.704+08');
INSERT INTO wellac."ServiceItemTemplate" VALUES (8, 'Urgent Express Checking for', '', 0, NULL, NULL, '2019-09-14 01:40:55.329+08', '2019-09-14 01:40:55.329+08');
INSERT INTO wellac."ServiceItemTemplate" VALUES (9, 'Chemical Pipe Flushing', '', 0, NULL, NULL, '2019-09-14 01:41:07.764+08', '2019-09-16 12:16:37.096+08');
INSERT INTO wellac."ServiceItemTemplate" VALUES (10, 'Installation for System 1+2', '', 0, NULL, NULL, '2019-09-14 01:41:19.637+08', '2019-09-14 01:41:19.637+08');



--
-- Data for Name: Entity; Type: TABLE DATA; Schema: wellac; Owner: simplify
--
INSERT INTO wellac."Entity" (id, name, address, logo, "contactNumber", "email", "createdAt", "updatedAt") VALUES (1, 'Entity 01', 'Company address 01', NULL, '+6531111111', 'a@mail.com', '2019-06-12 00:13:15.843+08', '2019-06-12 00:13:15.843+08');
INSERT INTO wellac."Entity" (id, name, address, logo, "contactNumber", "email", "createdAt", "updatedAt") VALUES (2, 'Entity 02', 'Company address 02', NULL, '+6531112222', 'b@mail.com', '2019-06-12 00:13:15.843+08', '2019-06-12 00:13:15.843+08');



--
-- Data for Name: Vehicle; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."Vehicle" VALUES (1, 'TOYOTA', 'VEH01', '2021-03-21', 't', '2019-09-16 13:45:42.223+08', '2019-09-20 13:38:14.729+08', 1);
INSERT INTO wellac."Vehicle" VALUES (2, 'TOYOTA', 'VEH02', '2022-05-11', 't', '2019-09-16 13:47:06.833+08', '2019-10-04 18:35:55.442+08', 2);
INSERT INTO wellac."Vehicle" VALUES (3, 'TOYOTA', 'VEH03', '2023-12-29', 'f', '2019-09-16 15:00:55.829+08', '2019-09-20 13:38:14.081+08', 3);


--
-- Data for Name: Client; Type: TABLE DATA; Schema: wellac; Owner: simplify
--
INSERT INTO wellac."Client" VALUES (1, 'Google Inc', 'COMMERCIAL', 'Mr. Google', '+6591112222', 'google@email.com','Mr. Google 02','+6591116666', 'google02@email.com', 'Singapore', 'Palo Alto Ave 5, United States of America',  '1', '1', '012221', 'Yes', 'PENDING', '', NULL, NULL, '2019-09-02 13:45:09.101+08', '2019-09-02 13:45:09.101+08');
INSERT INTO wellac."Client" VALUES (2, 'Facebook', 'COMMERCIAL', 'Mr. Facebook', '+6591113333', 'facebook@email.com','Mr. Facebook 02','+6591119999', 'facebook02@email.com', 'Singapore', 'Palo Alto Ave 9, United States of America',  '2', '2', '012222', 'Yes', 'PENDING', '', NULL, NULL, '2019-09-02 13:45:09.101+08', '2019-09-02 13:45:09.101+08');
INSERT INTO wellac."Client" VALUES (3, 'Instagram', 'COMMERCIAL', 'Mr. Instagram', '+6591114444', 'instagram@email.com','Mr. Instagram 02','+6591118888', 'instagram02@email.com', 'Singapore', 'Palo Alto Ave 3, United States of America',  '3', '3', '012223', 'Yes', 'PENDING', '', NULL, NULL, '2019-09-02 13:45:09.101+08', '2019-09-02 13:45:09.101+08');


--
-- Data for Name: ServiceAddress; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."ServiceAddress" VALUES (3, 'Mr. Instagram', '6591114444', 'Mr. Instagram 02', '6591118888', 'Singapore', 'Palo Alto Ave 3, United States of America', '1', '1', '012223', 3);
INSERT INTO wellac."ServiceAddress" VALUES (2, 'Mr. Facebook', '6591113333', 'Mr. Facebook 02', '6591119999', 'Singapore', 'Palo Alto Ave 9, United States of America', '2', '2', '012222', 2);
INSERT INTO wellac."ServiceAddress" VALUES (1, 'Mr. Google', '6591112222', 'Mr. Google 02', '6591116666', 'Singapore', 'Palo Alto Ave 5, United States of America', '3', '3', '012221', 1);


--
-- Data for Name: Service; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."Service" VALUES (1, 'CONTRACT', 'CT009', 'Contract 1', 'General Maintenance', 'CONFIRMED', true, 'Daily', 1, NULL, NULL, NULL, 'AFTER', 3, NULL, '2020-08-05', '2020-08-07', 1410, 'NA', 0, 98.7, 1508.70, NULL, NULL, '2019-08-05 15:10:29+08', '2019-08-05 15:10:37+08', 1, 1, 1);
INSERT INTO wellac."Service" VALUES (2, 'ADHOC', 'SV007', 'Contract 2',  'General Maintenance + Chemical Wash', 'CONFIRMED', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2020-07-17', '2020-10-17', 85, 'NA', 0, 5.95, 90.95, NULL, NULL, '2019-10-17 15:15:02+08', '2019-10-17 15:15:05+08', 3, 3, 1);

--
-- Data for Name: ServiceItem; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."ServiceItem" VALUES (1, 'General Chemical 2-in 1 + Anti-bacteria servicing + Steaming', NULL, 1, 220, 'NA', 0, 220, NULL, NULL, '2019-08-05 15:18:25+08', '2019-08-05 15:18:36+08', 1);
INSERT INTO wellac."ServiceItem" VALUES (2, 'General Pipe Cleaning', NULL, 1, 100, 'NA', 0, 100, NULL, NULL, '2019-08-05 15:19:31+08', '2019-08-05 15:19:43+08', 1);
INSERT INTO wellac."ServiceItem" VALUES (3, 'Up Freon', NULL, 1, 150, 'NA', 0, 150, NULL, NULL, '2019-08-05 15:20:37+08', '2019-08-05 15:20:44+08', 1);
INSERT INTO wellac."ServiceItem" VALUES (4, 'General Pipe Cleaning', NULL, 1, 50, 'NA', 0, 50, NULL, NULL, '2019-10-17 15:21:28+08', '2019-10-17 15:21:32+08', 2);
INSERT INTO wellac."ServiceItem" VALUES (5, 'Up Freon', NULL, 1, 35, 'NA', 0, 35, NULL, NULL, '2019-10-17 15:22:11+08', '2019-10-17 15:22:13+08', 2);



--
-- Data for Name: Job; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."Job" VALUES (1, '2020-08-05', '12:00:00', '14:00:00', 'COMPLETED', NULL, NULL, NULL, '2019-08-05 15:23:25+08', '2019-08-05 15:23:35+08', 1, 1, 1, NULL);
INSERT INTO wellac."Job" VALUES (2, '2020-08-06', '12:00:00', '14:00:00', 'UNASSIGNED', NULL, NULL, NULL, '2019-08-05 15:24:26+08', '2019-08-05 15:24:30+08', 1, 1, 1, NULL);
INSERT INTO wellac."Job" VALUES (3, '2020-08-07', '12:00:00', '14:00:00', 'ASSIGNED', NULL, NULL, NULL, '2019-08-05 15:25:29+08', '2019-08-05 15:25:37+08', 1, 1, 1, NULL);
INSERT INTO wellac."Job" VALUES (4, '2020-10-17', '10:00:00', '12:00:00', 'UNASSIGNED', NULL, NULL, NULL, '2019-10-17 15:31:29+08', '2019-10-17 15:31:32+08', 1, 2, 2, NULL);



--
-- Data for Name: ServiceItemJob; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."ServiceItemJob" VALUES (1, 1);
INSERT INTO wellac."ServiceItemJob" VALUES (2, 1);
INSERT INTO wellac."ServiceItemJob" VALUES (3, 1);
INSERT INTO wellac."ServiceItemJob" VALUES (1, 2);
INSERT INTO wellac."ServiceItemJob" VALUES (2, 2);
INSERT INTO wellac."ServiceItemJob" VALUES (3, 2);
INSERT INTO wellac."ServiceItemJob" VALUES (1, 3);
INSERT INTO wellac."ServiceItemJob" VALUES (2, 3);
INSERT INTO wellac."ServiceItemJob" VALUES (3, 3);
INSERT INTO wellac."ServiceItemJob" VALUES (4, 4);
INSERT INTO wellac."ServiceItemJob" VALUES (5, 4);


--
-- Data for Name: UserProfileJob; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."UserProfileJob" VALUES (1, 1);
INSERT INTO wellac."UserProfileJob" VALUES (2, 1);
INSERT INTO wellac."UserProfileJob" VALUES (3, 2);
INSERT INTO wellac."UserProfileJob" VALUES (4, 3);


--
-- Data for Name: Setting; Type: TABLE DATA; Schema: wellac; Owner: simplify
--

INSERT INTO wellac."Setting"  (id, "label", "code", "value", "isActive", "createdAt", "updatedAt") VALUES (1, 'Email Notification Completed Job', 'NOTIFCOMPLETEJOBEMAIL', NULL, 'Yes', '2019-08-05 15:18:25+08', '2019-08-05 15:18:36+08');


--
-- Name: Client_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."Client_id_seq"', 3, true);


--
-- Name: Job_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."Job_id_seq"', 8, true);


--
-- Name: Permission_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."Permission_id_seq"', 66, true);


--
-- Name: Role_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."Role_id_seq"', 2, true);


--
-- Name: ServiceAddress_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."ServiceAddress_id_seq"', 3, true);


--
-- Name: ServiceItemTemplate_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."ServiceItemTemplate_id_seq"', 10, true);


--
-- Name: ServiceItem_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."ServiceItem_id_seq"', 9, true);


--
-- Name: Service_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."Service_id_seq"', 6, true);


--
-- Name: Vehicle_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."Vehicle_id_seq"', 3, true);


--
-- Name: Invoice_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."Invoice_id_seq"', 1, true);


--
-- Name: ServiceTemplate_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."ServiceTemplate_id_seq"', 1, true);


--
-- Name: Entity_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."Entity_id_seq"', 3, true);


--
-- PostgreSQL database dump complete
--


--
-- Name: Setting_id_seq; Type: SEQUENCE SET; Schema: wellac; Owner: simplify
--

SELECT pg_catalog.setval('wellac."Setting_id_seq"', 1, true);
