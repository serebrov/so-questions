'use strict';

const https = require('https');
let fs = require('fs');

let dbTrigger = 0;

let config = { "ownerName": "github" };
console.log(new Date().toLocaleString() + '\tloaded configuration file');
console.log(new Date().toLocaleString() + '\tstarting Repos query');

apiReposCall(function done(repos) {
    var totalIssues = 0;
    repos.forEach(function (repo) {
        totalIssues += repo.totIssues;
    });
    console.log('Total issues: ' + totalIssues);
});

function apiReposCall(doneCallback, lastRead) {
    var query = JSON.stringify({
        query: "query" + (lastRead ? "($lastRead: String!)" : "") + "{" +
        "  organization(login: \"" + config.ownerName + "\") {" +
        "   repositories(first: 100" + (lastRead ? ", after: $lastRead" : "") + ") {" +
        "       pageInfo{" +
        "           endCursor" +
        "           hasNextPage" +
        "       }" +
        "       totalCount" +
        "       nodes {" +
        "           name" +
        "           url" +
        "           issues{" +
        "               totalCount" +
        "           }" +
        "       }" +
        "   }" +
        "  }" +
        "}",
        variables: { lastRead: lastRead }
    });

    const options = {
        hostname: 'api.github.com',
        path: '/graphql?access_token='+'462931f63a4e5ab05f49'+'e7f9ebe6c5e8548274d6',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Connection' : 'keep-alive',
            'User-Agent' : 'My-Agent'
        }
    };

    const req = https.request(options, function(res) {
        var response = ''
        res.on('data', function(chunk) { response += chunk;} );
        res.on('end', function() { dataToJson(response, doneCallback); });
    });

    req.on('error', (e) => {
        console.error(e);
    });
    req.write(query);
    req.end();
}

function dataToJson(responseData, doneCallback) {
    var gitHubResponse = JSON.parse(responseData)
    var result = fillRepos(gitHubResponse);
    var repos = result["repos"];
    var totalIssues = result["totalIssues"];

    var hasNextPage = gitHubResponse.data.organization.repositories.pageInfo.hasNextPage;
    var lastRead = gitHubResponse.data.organization.repositories.pageInfo.endCursor;
    if (hasNextPage === true) {
        apiReposCall(function(repos) {
            repos.concat(repos);
        }, lastRead);
    } else {
        console.log(new Date().toLocaleString() + '\tended Repos query');
        console.log(new Date().toLocaleString() + '\tstarting Issues query');
    }
    doneCallback(repos);
}

function fillRepos(gitHubResponse) {
    var repos = []
    var totalIssues = 0;
    gitHubResponse.data.organization.repositories.nodes.forEach(function (repository) {
        let currentRepo = parseRepo(repository);
        totalIssues += currentRepo.totIssues;
        repos.push(currentRepo);
        if(currentRepo.totIssues > 0)
            dbTrigger++;
    });
    return {"repos": repos, "totalIssues": totalIssues};
}

function parseRepo(repository){
    let newRepo = {
        name: "",
        url: "",
        totIssues: 0,
    };

    newRepo.totIssues = repository.issues.totalCount;
    newRepo.name = repository.name;
    newRepo.url = repository.url;
    return newRepo;
}

        //repos.forEach(function (repo) {
        //    if(repo.totIssues > 0){
        //        apiIssuesCall(repo, callNumber);
        //    }
        //});
//function apiIssuesCall(repo, callNumber) {
    //if((callNumber==1 || hasNextPage === true) ) {
        ////forming json request
        //var query = JSON.stringify({
        //    query: "query" + (callNumber > 1 ? "($lastRead: String!)" : "") + "{" +
        //    "  repository(owner: \"" + config.ownerName + "\", name: \"" + repo.name + "\") {" +
        //    "    issues(first: 100" + (callNumber > 1 ? ", after: $lastRead" : "") + ") {" +
        //    "      pageInfo{" +
        //    "        endCursor" +
        //    "        hasNextPage" +
        //    "      }" +
        //    "      edges {" +
        //    "        node {" +
        //    "          createdAt" +
        //    "          closed" +
        //    "          labels(first: 10){" +
        //    "            totalCount" +
        //    "            nodes{" +
        //    "               name" +
        //    "            }" +
        //    "          }" +
        //    "          comments(first: 1) {" +
        //    "            edges{" +
        //    "              node{" +
        //    "                createdAt" +
        //    "              }" +
        //    "            }" +
        //    "          }" +
        //    "          timeline(last: 100){" +
        //    "            nodes {" +
        //    "              ... on ClosedEvent {" +
        //    "                createdAt" +
        //    "                }" +
        //    "            }" +
        //    "          }" +
        //    "        }" +
        //    "      }" +
        //    "    }" +
        //    "  }" +
        //    "}",
        //    variables: {lastRead: lastRead}
        //});

        //const options = {
        //    hostname: 'api.github.com',
        //    path: '/graphql?access_token='+'462931f63a4e5ab05f49'+'e7f9ebe6c5e8548274d6',
        //    method: 'POST',
        //    headers: {
        //        'Content-Type': 'application/json',
        //        'Connection' : 'keep-alive',
        //        'User-Agent' : 'My-Agent'
        //    }
        //};

        //const req = https.request(options, function(res) { workOnIssueResponse(res, repo) });

        //req.on('error', (e) => {
        //    console.error(e);
        //});
        //req.write(query);

        //req.end();
    //}

    //function workOnIssueResponse(res, repo) {
        //var response = '';
        //res.on('data', function(chunk) { response += chunk; });
        //res.on('end', function() { dataIssueToJson(response, repo); });
    //}

    //function dataIssueToJson(responseData, repo) {
        //console.log(new Date().toLocaleString() + '\tgithub response: ')
        //console.log(responseData);
        //console.log();
        //gitHubResponse = JSON.parse(responseData);
        //fillRepoIssues(gitHubResponse, repo);

        //hasNextPage = gitHubResponse.data.repository.issues.pageInfo.hasNextPage;
        //lastRead = gitHubResponse.data.repository.issues.pageInfo.endCursor;
        //issueResponseHasNextPage();

    //}

    //function fillRepoIssues(gitHubResponse, repo) {
        //if(typeof repo.issues == 'undefined')
        //{
        //    repo.issues = [];
        //}
        //gitHubResponse.data.repository.issues.edges.forEach( function (issue) {
        //    var currentIssue = parseIssue(issue);
        //    repo.issues.push(currentIssue);
        //});
    //}

    //function issueResponseHasNextPage () {
        //if (hasNextPage === true) {
        //    apiIssuesCall(repo, ++callNumber);
        //}
        //else {
        //    if(--dbTrigger == 0)
        //    {
        //        /*ONLY FOR FINAL DEBUG*/
        //        /*THIS FILE IS READY TO BE WRITTEN IN A DB*/
        //        // fs.appendFile("reposFinale.json", JSON.stringify(repos), function(err) {
        //        //     if(err) {
        //        //         return console.log(err);
        //        //     }
        //        //
        //        // });
        //        console.log(new Date().toLocaleString() + '\tended Issues query');
        //        console.log(new Date().toLocaleString() + '\tstarting db update');
        //    }

        //}
    //}
//}

//function parseIssue(issue) {
    //let currentIssue = {
        //createdAt: 0,
        //labels: [],
        //firstResponseTime: 0
    //};

    //let dateIssue = new Date(issue.node.createdAt).getTime();
    //if(issue.node.labels.nodes.length > 0){
        //currentIssue.labels = [];
        //issue.node.labels.nodes.forEach(function (label) {
        //    currentIssue.labels.push(label.name);
        //})
    //}

    //if(issue.node.comments.edges.length != 0){
        //let firstResponse = new Date(issue.node.comments.edges[0].node.createdAt).getTime();
        //currentIssue.firstResponseTime = firstResponse - dateIssue;
    //}

    //currentIssue.createdAt = dateIssue;

    //if(issue.node.closed){
        //issue.node.timeline.nodes.forEach(function (node) {
        //    if(node.createdAt){
        //        currentIssue.closedAt = new Date(node.createdAt).getTime();
        //        currentIssue.closeTime = currentIssue.closedAt - dateIssue;
        //    }
        //})
    //}

    //return currentIssue;
//}
