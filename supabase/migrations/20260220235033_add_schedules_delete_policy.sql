-- ==================================================
-- Migration: Add DELETE policy to schedules table
-- ==================================================

-- Drop existing if for some reason it exists
DROP POLICY IF EXISTS "Técnicos podem excluir seus agendamentos" ON schedules;

-- Create DELETE policy
CREATE POLICY "Técnicos podem excluir seus agendamentos"
    ON schedules FOR DELETE
    USING (auth.uid() = user_id);
