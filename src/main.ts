import * as core from '@actions/core';
import * as exec from '@actions/exec';

import { CodeSigner } from './setup-codesigner/codesigner';
import { JavaDistribution } from './setup-jdk/installer';
import { inputCommands } from './util';

async function run(): Promise<void> {
    try {
        core.debug('Run CodeSigner');
        core.debug('Running ESigner.com CodeSign Action ====>');

        let command = inputCommands();
        core.info(`Input Commands: ${command}`);

        const codesigner = new CodeSigner();
        const execCommand = await codesigner.setup();

        command = `${execCommand} ${command}`;
        core.info(`CodeSigner Command: ${command}`);

        const distribution = new JavaDistribution();
        await distribution.setup();

        const result = await exec.getExecOutput(command);
        if (
            result.stdout.includes('Error') ||
            result.stdout.includes('Exception') ||
            result.stdout.includes('Missing required option') ||
            result.stderr.includes('Error') ||
            result.stderr.includes('Exception') ||
            result.stderr.includes('Missing required option')
        ) {
            core.info('');
            core.setFailed('Something Went Wrong. Please try again.');
            return;
        }

        core.setOutput('CodeSigner', result);
    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
    }
}

run().then();
