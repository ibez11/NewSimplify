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
-- Data for Name: Role; Type: TABLE DATA; Schema: gcool; Owner: simplify
--

INSERT INTO gcool."Role" (id, name, "createdAt", "updatedAt") VALUES (1, 'ADMIN', '2019-06-12 23:48:25.187+08', '2019-06-12 23:48:28.754+08');
INSERT INTO gcool."Role" (id, name, "createdAt", "updatedAt") VALUES (2, 'TECHNICIAN', '2019-09-18 18:15:12+08', '2019-09-18 18:15:16+08');



--
-- Data for Name: UserProfile; Type: TABLE DATA; Schema: gcool; Owner: simplify
--

INSERT INTO gcool."UserProfile" (id, "displayName", email, "contactNumber", "token", "createdAt", "updatedAt") VALUES (7, 'Lily', 'lily.gcoolengrg@gmail.com', '6590000555', NULL, '2019-06-12 00:13:13.426+08', '2019-06-12 00:13:15.843+08');
INSERT INTO gcool."UserProfile" (id, "displayName", email, "contactNumber", "token", "createdAt", "updatedAt") VALUES (8, 'Employee01', 'employee01@gcool.com', '6590000555', NULL, '2019-06-12 00:13:13.426+08', '2019-06-12 00:13:15.843+08');



--
-- Data for Name: UserProfileRole; Type: TABLE DATA; Schema: gcool; Owner: simplify
--

INSERT INTO gcool."UserProfileRole" ("createdAt", "updatedAt", "userProfileId", "roleId") VALUES ('2019-09-16 14:59:47.577+08', '2019-09-16 14:59:47.577+08', 7, 1);
INSERT INTO gcool."UserProfileRole" ("createdAt", "updatedAt", "userProfileId", "roleId") VALUES ('2019-09-16 14:59:47.577+08', '2019-09-16 14:59:47.577+08', 8, 2);



--
-- Data for Name: Permission; Type: TABLE DATA; Schema: gcool; Owner: simplify
--

INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (1, 'ADMINISTRATION', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (2, 'USERS', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (3, 'USERS', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (4, 'USERS', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (5, 'USERS', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (6, 'USERS', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (7, 'SERVICE_ITEM_TEMPLATES', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (8, 'SERVICE_ITEM_TEMPLATES', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (9, 'SERVICE_ITEM_TEMPLATES', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (10, 'SERVICE_ITEM_TEMPLATES', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (11, 'SERVICE_ITEM_TEMPLATES', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (12, 'CLIENTS', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (13, 'CLIENTS', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (14, 'CLIENTS', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (15, 'CLIENTS', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (16, 'CLIENTS', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (17, 'VEHICLES', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (18, 'VEHICLES', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (19, 'VEHICLES', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (20, 'VEHICLES', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (21, 'VEHICLES', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (22, 'SERVICES', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (23, 'SERVICES', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (24, 'SERVICES', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (25, 'SERVICES', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (26, 'SERVICES', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (27, 'ENTITIES', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (28, 'ENTITIES', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (29, 'ENTITIES', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (30, 'ENTITIES', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (31, 'ENTITIES', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (32, 'JOBS', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (33, 'JOBS', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (34, 'JOBS', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (35, 'JOBS', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (36, 'JOBS', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (37, 'SERVICES_ADDRESSES', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (38, 'SERVICES_ADDRESSES', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (39, 'SERVICES_ADDRESSES', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (40, 'SERVICES_ADDRESSES', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (41, 'SERVICES_ADDRESSES', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (42, 'SERVICES_ITEMS', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (43, 'SERVICES_ITEMS', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (44, 'SERVICES_ITEMS', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (45, 'SERVICES_ITEMS', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (46, 'SERVICES_ITEMS', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (47, 'JOB_NOTES', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (48, 'JOB_NOTES', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (49, 'JOB_NOTES', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (50, 'JOB_NOTES', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (51, 'JOB_NOTES', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (52, 'INVOICES', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (53, 'INVOICES', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (54, 'INVOICES', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (55, 'INVOICES', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (56, 'INVOICES', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (57, 'SERVICE_TEMPLATES', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (58, 'SERVICE_TEMPLATES', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (59, 'SERVICE_TEMPLATES', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (60, 'SERVICE_TEMPLATES', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (61, 'SERVICE_TEMPLATES', 'DELETE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (62, 'SETTING', 'ACCESS');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (63, 'SETTING', 'VIEW');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (64, 'SETTING', 'CREATE');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (65, 'SETTING', 'EDIT');
INSERT INTO gcool."Permission" (id, module, "accessLevel") VALUES (66, 'SETTING', 'DELETE');




--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: gcool; Owner: simplify
--

INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 1);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 2);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 3);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 4);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 5);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 6);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 7);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 8);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 9);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 10);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 11);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 12);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 13);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 14);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 15);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 16);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 17);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 18);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 19);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 20);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 21);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 22);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 23);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 24);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 25);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 26);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 27);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 28);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 29);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 30);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 31);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 32);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 33);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 34);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 35);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 36);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 37);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 38);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 39);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 40);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 41);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 42);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 43);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 44);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 45);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 46);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 47);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 48);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 49);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 50);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 51);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 52);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 53);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 54);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 55);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 56);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 57);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 58);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 59);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 60);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 61);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 62);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 63);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 64);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 65);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (1, 66);

INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 1);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 2);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 3);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 5);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 7);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 8);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 12);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 13);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 17);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 18);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 22);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 23);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 24);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 32);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 33);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 35);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 37);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 38);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 42);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 43);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 47);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 48);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 49);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 50);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 51);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 52);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 53);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 57);
INSERT INTO gcool."RolePermission" ("roleId", "permissionId") VALUES (2, 58);


INSERT INTO gcool."Setting"  (id, "label", "code", "value", "isActive", "createdAt", "updatedAt") VALUES (1, 'Email Notification Completed Job', 'NOTIFCOMPLETEJOBEMAIL', NULL, 'Yes', '2019-08-05 15:18:25+08', '2019-08-05 15:18:36+08');


--
-- Name: Client_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."Client_id_seq"', 1, true);


--
-- Name: Job_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."Job_id_seq"', 1, true);


--
-- Name: Permission_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."Permission_id_seq"', 66, true);


--
-- Name: Role_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."Role_id_seq"', 2, true);


--
-- Name: ServiceAddress_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."ServiceAddress_id_seq"', 1, true);


--
-- Name: ServiceItemTemplate_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."ServiceItemTemplate_id_seq"', 1, true);


--
-- Name: ServiceItem_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."ServiceItem_id_seq"', 1, true);


--
-- Name: Service_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."Service_id_seq"', 1, true);


--
-- Name: Vehicle_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."Vehicle_id_seq"', 1, true);


--
-- Name: Invoice_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."Invoice_id_seq"', 1, true);


--
-- Name: ServiceTemplate_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."ServiceTemplate_id_seq"', 1, true);


--
-- Name: Entity_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."Entity_id_seq"', 3, true);


--
-- PostgreSQL database dump complete
--


--
-- Name: Setting_id_seq; Type: SEQUENCE SET; Schema: gcool; Owner: simplify
--

SELECT pg_catalog.setval('gcool."Setting_id_seq"', 1, true);
