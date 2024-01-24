# SPID app test
Bootstrap project

## Getting started
0. `cp .env.example .env` and change it accordingly
1. start docker compose  
`$ docker compose up`
2. navigate to  
`https://localhost:4000`
3. Click to access button and select "IDP test"
4. Click on "Continue"
5. Click on all entry in left pane menu to check metadata, request and response if they meet all requirements.
6. Under Response -> Check Response make sure you have selected all requested fields in your own metadata (should be already like this), sign both Response and Assertion and eventually manipulate requested fields as you want and Send the response back to the client.
7. A page with resultant data should be displayed
