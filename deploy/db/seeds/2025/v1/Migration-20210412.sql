--
-- Add additional column agent to client
--

ALTER TABLE wellac."Client"
ADD COLUMN "agentId" integer;

--
-- Name: Job Client_agentId_fkey; Type: FK CONSTRAINT; Schema: wellac; Owner: simplify
--

ALTER TABLE ONLY wellac."Client"
    ADD CONSTRAINT "Client_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES wellac."Agent"(id) ON DELETE SET NULL ON UPDATE CASCADE;
