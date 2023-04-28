import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kxsykxxcjdlqpwyoejuj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c3lreHhjamRscXB3eW9lanVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODE5ODY1MzMsImV4cCI6MTk5NzU2MjUzM30.lSBJXvChbAJAE_088UUqoDeJB09RScK5JXy7BMCSU4s";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
