const Crypto = require('crypto');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    
    const hmac = Crypto.createHmac("sha1", "SVquj8Mya31tYwdKalSXPcbi1Iksm2cMOyXWUHS2//wYAjokodWyow==");
    const signature = hmac.update(JSON.stringify(req.body)).digest('hex');
    const shaSignature = `sha1=${signature}`;
    const gitHubSignature = req.headers['x-hub-signature'];

    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully: "  + JSON.stringify(context)
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";
    
    if (!shaSignature.localeCompare(gitHubSignature)) {
        if (req.body.pages && req.body.pages[0].title) {
            context.res = {
                body: {
                    "Repository": req.body.repository.name,
                    "Event Type": req.headers['x-github-event'],
                    "Page": req.body.pages[0].title, 
                    "Action": req.body.pages[0].action
                }
            };
        } 
        if (req.body.issue && req.body.issue.title) {
            context.res = {
                body: {
                    "Repository": req.body.repository.name,
                    "Event Type": req.headers['x-github-event'],
                    "Action": req.body.issue.action,
                    "Title": req.body.issue.title,
                    "State": req.body.issue.state
                }
            };
        }
        else {
            context.res = {
                status: 400,
                body: {"message": "Invalid payload for Wiki or Issue event"}
            };
        }
    }
    else {
        context.res = {
            status: 401,
            body: {"message": "Signatures don't match"}
        };
    }
}
