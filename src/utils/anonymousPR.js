const { Octokit } = require("@octokit/rest");

export async function createAnonymousPR({
    botUserName,
    botPersonnalToken,
    repoName,
    upstreamOwner,
    upstreamTargetBranch,
    filePath,
    base64data
}) {
    const octokit = new Octokit({
        auth: botPersonnalToken
    });
    let fork_main_head;
    console.log(
        `Updating the fork to match the upstream ${upstreamTargetBranch} branch`
    );
    try {
        console.log(
            `Creating a PR from ${upstreamOwner}/${repoName}:${upstreamTargetBranch} towards ${botUserName}/${repoName}:${upstreamTargetBranch}`
        );

        const pr = await octokit.pulls.create({
            owner: botUserName,
            repo: repoName,
            title: "update fork from upstream",
            head: `${upstreamOwner}:${upstreamTargetBranch}`,
            base: upstreamTargetBranch,
            maintainer_can_modify: false
        });

        console.log(`PR number is ${pr.data.number}`);

        const merge = await octokit.pulls.merge({
            owner: botUserName,
            repo: repoName,
            pull_number: pr.data.number,
            merge_method: "merge"
        });

        console.log("PR has been merged");

        fork_main_head = merge.data.sha;
    } catch (e) {
        console.log(
            "Creation of a PR has failed, repo are probably identical, it's ok"
        );
        // TODO : check why it failed, it could be another reason than identical repos
        const main_ref = await octokit.git.getRef({
            owner: botUserName,
            repo: repoName,
            ref: `heads/${upstreamTargetBranch}`
        });
        fork_main_head = main_ref.data.object.sha;
    }

    console.log(`Creating a branch in ${botUserName}/${repoName}`);
    const branch_name = `branch-${Date.now()}`;

    await octokit.git.createRef({
        owner: botUserName,
        repo: repoName,
        ref: `refs/heads/${branch_name}`,
        sha: fork_main_head
    });

    console.log(`Branch ${branch_name} successfully created`);

    const current_file = await octokit.repos.getContent({
        owner: botUserName,
        repo: repoName,
        path: filePath,
        ref: branch_name
    });

    console.log("Current file sha is ", current_file.data.sha);

    await octokit.repos.createOrUpdateFileContents({
        owner: botUserName,
        repo: repoName,
        path: filePath,
        branch: branch_name,
        message: "update the file",
        content: base64data,
        sha: current_file.data.sha,
        "committer.name": botUserName,
        "committer.email": "the-nice-bot@gmail.com",
        "author.name": botUserName,
        "author.email": "the-nice-bot@gmail.com"
    });
    console.log(
        `Create a commit in the new branch, modifying ${filePath} with the provided content`
    );

    console.log(
        `Creating a PR from ${botUserName}/${repoName}:${branch_name} towards ${upstreamOwner}/${repoName}:${upstreamTargetBranch}`
    );

    const pr_upstream = await octokit.pulls.create({
        owner: upstreamOwner,
        repo: repoName,
        title: "proposition de contribution",
        head: `${botUserName}:${branch_name}`,
        base: upstreamTargetBranch,
        maintainer_can_modify: false
    });
    console.log(`PR number is ${pr_upstream.data.number} !`);
    console.log(`✌️‍‍`);
    return pr_upstream
}
