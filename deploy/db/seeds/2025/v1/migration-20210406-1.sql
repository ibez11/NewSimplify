
-- for update permission data

INSERT INTO wellac."Permission" VALUES (67,'AGENT', 'ACCESS'),
                        (68,'AGENT', 'VIEW'),
                        (69,'AGENT', 'CREATE'),
                        (70,'AGENT', 'EDIT'),
                        (71,'AGENT', 'DELETE');

INSERT INTO wellac."RolePermission" ("roleId","permissionId") VALUES (1,67), (1,68), (1,69), (1,70), (1,71);