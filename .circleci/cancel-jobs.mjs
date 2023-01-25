import fetch from 'node-fetch';

const baseUrl = 'https://circleci.com/api/v2';

async function getJobs() {
  const url = `${baseUrl}/workflow/${process.env.CIRCLE_WORKFLOW_ID}/job?circle-token=${process.env.CIRCLE_TOKEN}`;
  const response = await fetch(url);
  const json = await response.json();
  const jobs = json?.items || [];
  console.log(`Got ${jobs.length} jobs.`);

  return jobs;
}

async function cancelJob(job) {
  const url = `${baseUrl}/project/gh/mozilla/fxa/job/${job.job_number}/cancel?circle-token=${process.env.CIRCLE_TOKEN}`;
  const response = await fetch(url, { method: 'POST' });
  console.log(`Cancelled ${job.name}[${job.job_number}] - ${response.status}`)
}

const jobs = await getJobs();
for (const job of jobs) {
  await cancelJob(job);
}
