const QUESTIONS = [
  {q:"You finish your assigned task, but there is still time left in the day. What would you most likely do?", a:["Review what you completed and look for possible issues.","Pick up another task from the existing backlog.","Explore an idea you have wanted to try.","Check with your lead about what should come next."]},
  {q:"A teammate suggests that your implementation could be better. What is your first move?", a:["Ask which trade-off or issue they are concerned about.","Check whether the current implementation meets the requirements.","Compare both approaches and investigate before deciding.","Change it if the improvement is worth the extra time."]},
  {q:"You receive a task involving a technology you have not used before. How do you usually begin?", a:["Find a similar implementation in the existing codebase.","Read the documentation and build a small test.","Ask someone experienced how they would approach it.","Start with a small working approach and learn as issues appear."]},
  {q:"A deadline is close, but you discover an edge case that was not mentioned in the task. What would you do?", a:["Handle it if it could affect real users.","Tell the lead and agree on its priority.","Finish the agreed scope and document the edge case.","Estimate the effort and risk before deciding."]},
  {q:"Your team can spend Friday improving one area. Which would you prefer?", a:["Reducing bugs and improving reliability.","Building a new feature customers have requested.","Improving internal tools and removing repetitive work.","Exploring a technical approach that might help later."]},
  {q:"A task feels very similar to something you did last month. What would you probably do?", a:["Reuse the previous approach to finish efficiently.","Check whether the previous approach can be simplified.","Try a different approach if there is a clear benefit.","Complete it as specified and move to the next task."]},
  {q:"A customer gives negative feedback about a project you contributed to. What would you focus on first?", a:["Understanding where the customer's expectation was missed.","Identifying the technical cause of the issue.","Helping the team decide on the most useful response.","Checking whether the original requirements were clear."]},
  {q:"You have three equally urgent tasks. How would you choose which to start?", a:["Choose the one with the clearest expected outcome.","Choose the one where I can develop a useful skill.","Choose the one that removes the biggest problem for the team.","Choose the one I can progress independently with current information."]},
  {q:"A task is blocked because another team has not provided information. What would you usually do?", a:["Follow up and explain the impact of the missing information.","Work on another part while waiting.","Make a reasonable assumption and test whether it works.","Ask the lead to help resolve the dependency."]},
  {q:"Your role could change slightly over the next three months. Which trade-off would you be most comfortable with?", a:["More responsibility but less certainty about the solution.","More predictable tasks with clearer requirements.","More time to investigate before committing to a solution.","More collaboration but less control over the final approach."]},
  {q:"A tool you use every day has an annoying limitation. What would you most likely do?", a:["Work around it and keep moving.","Look for an existing tool or setting that fixes it.","Experiment with a small improvement or automation.","Raise it with the person responsible for the tool."]},
  {q:"You receive a task with a broad goal but few instructions. What feels most natural?", a:["Clarify the outcome and propose a plan.","Break it into small steps and start with the first one.","Research examples before choosing an approach.","Ask for a more detailed task definition before starting."]},
  {q:"A colleague is struggling with a problem you have solved before. What would you usually do?", a:["Explain the reasoning so they can solve similar problems later.","Share the relevant solution or reference quickly.","Pair with them to investigate the problem together.","Continue with my own priorities unless they ask for help."]},
  {q:"After a release, there is an optional review to identify improvements. How would you approach it?", a:["Review errors and user feedback for concrete issues.","Suggest changes to the process that slowed the team down.","Explore whether a different solution could work better next time.","Join if it is required or if a clear issue has been raised."]},
  {q:"Think about a week when your work felt less satisfying than usual. What is most likely to have contributed?", a:["Too many interruptions or unclear priorities.","Too much repetitive work with little room to improve it.","Not enough context, support, or confidence to move forward.","The tasks did not connect clearly to outcomes I care about."]}
];

// The ID from your sheet's URL: https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit
const SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';

function getSpreadsheet_() {
  if (!SHEET_ID || SHEET_ID === 'PASTE_YOUR_SHEET_ID_HERE') throw new Error('Set SHEET_ID at the top of Code.gs.');
  return SpreadsheetApp.openById(SHEET_ID);
}

// JSON API used by the frontend (index.html / admin.html).
// GET  ?action=questions
// POST {action:'submit', payload:{...}} | {action:'admin', pin:'...'}
function doGet(e) {
  return respond_(() => {
    const action = e && e.parameter && e.parameter.action;
    if (action === 'questions') return {questions: getQuestions()};
    throw new Error('Unknown action.');
  });
}

function doPost(e) {
  return respond_(() => {
    let body;
    try { body = JSON.parse(e.postData.contents); } catch (err) { throw new Error('Invalid request body.'); }
    if (body.action === 'submit') return submitResponse(body.payload);
    if (body.action === 'admin') return getAdminData(body.pin);
    throw new Error('Unknown action.');
  });
}

function respond_(fn) {
  let out;
  try { out = Object.assign({ok:true}, fn()); }
  catch (err) { out = {ok:false, error: err.message || String(err)}; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function getQuestions() {
  return QUESTIONS.map((item, i) => ({id: i + 1, q: item.q, a: item.a}));
}

function setupSheet() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName('Responses');
  if (!sheet) sheet = ss.insertSheet('Responses');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp','Employee Name','Team / Role','Motivation Score','Interest Score','Preliminary Quadrant','Answers JSON','Examples / Notes']);
    sheet.setFrozenRows(1);
  }
  let settings = ss.getSheetByName('Settings');
  if (!settings) {
    settings = ss.insertSheet('Settings');
    settings.getRange('A1:B3').setValues([
      ['Setting','Value'],
      ['Admin PIN','ChangeThisPIN'],
      ['Scoring note','Preliminary indicator only; review examples and work evidence before acting.']
    ]);
    settings.setFrozenRows(1);
  }
  return 'Setup complete. Change the Admin PIN in the Settings sheet before sharing the admin URL.';
}

function submitResponse(payload) {
  if (!payload || !payload.name || !payload.answers) throw new Error('Please enter your name and answer all 15 questions.');
  const answers = payload.answers;
  if (Object.keys(answers).length !== QUESTIONS.length) throw new Error('Please answer all 15 questions.');
  QUESTIONS.forEach((q, i) => {
    const n = Number(answers[String(i + 1)]);
    if (!Number.isInteger(n) || n < 0 || n > 3) throw new Error('Invalid answer for question ' + (i + 1));
  });

  // Transparent provisional scoring: question groups are indicators, not a validated psychological test.
  // Motivation indicators: initiative, follow-through, persistence, and action under uncertainty.
  const motivationQuestions = [1,2,4,8,9,11,12,13,14];
  // Interest indicators: preferred work, curiosity, learning, and engagement with task types.
  const interestQuestions = [3,5,6,7,10,15];
  const motivation = scoreGroup_(answers, motivationQuestions);
  const interest = scoreGroup_(answers, interestQuestions);
  const quadrant = motivation >= 1.5
    ? (interest >= 1.5 ? 'Q1 — Drivers' : 'Q2 — Misaligned')
    : (interest >= 1.5 ? 'Q3 — Untapped Potential' : 'Q4 — Disconnected');

  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName('Responses');
  if (!sheet) {
    setupSheet();
    sheet = ss.getSheetByName('Responses');
  }
  sheet.appendRow([
    new Date(),
    String(payload.name).trim().slice(0,120),
    String(payload.team || '').trim().slice(0,120),
    motivation,
    interest,
    quadrant,
    JSON.stringify(answers),
    String(payload.notes || '').trim().slice(0,3000)
  ]);
  return {ok:true, message:'Your responses have been submitted. Thank you.'};
}

function scoreGroup_(answers, ids) {
  // Each answer maps to 0..3 as a self-reported preference. The mapping is intentionally provisional;
  // response choices are balanced, and no option is presented as the "correct" answer.
  const vals = ids.map(id => Number(answers[String(id)]));
  return Math.round((vals.reduce((a,b)=>a+b,0) / vals.length) * 100) / 100;
}

function getAdminData(pin) {
  const ss = getSpreadsheet_();
  const settings = ss.getSheetByName('Settings');
  if (!settings) throw new Error('Run setupSheet() first.');
  const savedPin = String(settings.getRange('B2').getDisplayValue());
  if (!pin || String(pin) !== savedPin) throw new Error('Incorrect admin PIN.');
  const sheet = ss.getSheetByName('Responses');
  if (!sheet || sheet.getLastRow() < 2) return {rows:[], counts:{q1:0,q2:0,q3:0,q4:0}, total:0};
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1).map((r, i) => ({
    row: i + 2,
    timestamp: r[0] instanceof Date ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') : String(r[0]),
    name: String(r[1] || ''),
    team: String(r[2] || ''),
    motivation: Number(r[3] || 0),
    interest: Number(r[4] || 0),
    quadrant: String(r[5] || ''),
    answers: String(r[6] || '{}'),
    notes: String(r[7] || '')
  })).reverse();
  const counts = {q1:0,q2:0,q3:0,q4:0};
  rows.forEach(r => {
    if (r.quadrant.startsWith('Q1')) counts.q1++;
    else if (r.quadrant.startsWith('Q2')) counts.q2++;
    else if (r.quadrant.startsWith('Q3')) counts.q3++;
    else if (r.quadrant.startsWith('Q4')) counts.q4++;
  });
  return {rows, counts, total:rows.length};
}
