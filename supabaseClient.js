// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://glgzfyirwzwvlikdtuog.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZ3pmeWlyd3p3dmxpa2R0dW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMjQzODIsImV4cCI6MjA5MTgwMDM4Mn0.-j4jRxp4urbJ4LEV8HwCF07TaLXvZscqXSpcJCVDreE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);