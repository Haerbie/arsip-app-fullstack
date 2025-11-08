flowchart TD
    SignIn[Sign In Page] --> Dashboard[Dashboard]
    Dashboard --> Sidebar[Sidebar Navigation]
    Sidebar --> BerkasList[Berkas Arsip List]
    BerkasList --> CreateBerkas[Berkas Arsip Creation]
    CreateBerkas --> BerkasDetail[Berkas Arsip Detail]
    BerkasDetail --> AddArsipUnit[Add Arsip Unit]
    AddArsipUnit --> ValidateRole[Validate User Role]
    ValidateRole --> DB[MySQL via Drizzle ORM]