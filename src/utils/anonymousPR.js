const { Octokit } = require("@octokit/rest");

export async function createAnonymousPR({
    botUserName, // TODO : fetch the user name from the personal token
    botPersonalToken,
    repoName,
    upstreamOwner,
    upstreamTargetBranch,
    filePath,
    base64data
}) {
    const octokit = new Octokit({
        auth: botPersonalToken
    });
    let fork_main_head;
    console.log(
        `Updating the fork to match the upstream ${upstreamTargetBranch} branch`
    );
    try {
        // we try to create a PR and merge it
        // it can fail, for example if the fork is already up-to-date with the upstream
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
            `Creation of the PR has failed, meaning ${botUserName}/${repoName}:${upstreamTargetBranch} should not be behind ${upstreamOwner}/${repoName}:${upstreamTargetBranch}`
        );
        console.log(
            `Just checking if ${botUserName}/${repoName}:${upstreamTargetBranch} is up-to-date`
        );

        const compare = await octokit.repos.compareCommits({
            owner: botUserName,
            repo: repoName,
            head: upstreamTargetBranch,
            base: `${upstreamOwner}:${upstreamTargetBranch}`
        });

        if (compare.data.behind_by === 0) {
            console.log(
                `Good! ${botUserName}/${repoName}:${upstreamTargetBranch} is up-to-date`
            );
            const fork_head_ref = await octokit.git.getRef({
                owner: botUserName,
                repo: repoName,
                ref: `heads/${upstreamTargetBranch}`
            });
            fork_main_head = fork_head_ref.data.object.sha;
        } else {            
            console.error(`Unable to merge ${upstreamOwner}/${repoName}:${upstreamTargetBranch} in ${botUserName}/${repoName}:${upstreamTargetBranch}, but it is necessary! Aborting...`)
            throw(`PR creation has failed. Aborting.`)
        }
    }

    console.log(`Creating a branch in ${botUserName}/${repoName}`);
    // branch_name is unique, as it includes the number of milliseconds since January 1, 1970
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
