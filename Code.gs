// Each question measures one dimension (d). Each option is [text, score 0..3].
// Scores are not tied to option position, and questions from different dimensions are mixed,
// so there is no single "pattern" for the best answer.
const DIMENSIONS = {
  attitude:   'Attitude',    // ownership, openness to feedback, adaptability, collaboration
  skill:      'Skill',       // self-assessed competence: problem solving, estimation, quality, learning
  interest:   'Interest',    // enjoyment of and curiosity about the work itself
  motivation: 'Motivation'   // drive, initiative, persistence, goal-setting
};

const QUESTIONS = [
  {d:'motivation', q:"You finish your assigned work with time left in the day. What would you most likely do?", a:[
    ["Pick up the next item from the backlog.", 2],
    ["Ask your lead what to do next.", 1],
    ["Find something that would help the team and start on it.", 3],
    ["Ease off; the planned work is done.", 0]]},
  {d:'attitude', q:"A teammate points out a mistake in work you already delivered. What is your first reaction?", a:[
    ["Explain the reasoning behind your approach first.", 1],
    ["Fix it quietly so it doesn't turn into a bigger discussion.", 1],
    ["Thank them, check it, and fix it if they're right.", 3],
    ["Point out that it was already reviewed and approved.", 0]]},
  {d:'skill', q:"Something you built stops working and the cause isn't obvious. What do you usually do first?", a:[
    ["Check recent changes and undo them until it works again.", 2],
    ["Search for the error and try the suggested fixes.", 1],
    ["Reproduce it, narrow down where it breaks, and test one cause at a time.", 3],
    ["Ask someone who knows the area to take a look.", 1]]},
  {d:'interest', q:"Outside of assigned tasks, how often do you read about or explore topics related to your work?", a:[
    ["Sometimes, when it relates to something I'm working on.", 2],
    ["Rarely; I prefer to keep work and personal time separate.", 1],
    ["Regularly; I follow my field because I enjoy it.", 3],
    ["Almost never; it isn't something I'm drawn to.", 0]]},
  {d:'attitude', q:"Your team's priorities change mid-week and your current work is paused. How do you usually respond?", a:[
    ["Switch, but make a note of the effort lost on the paused work.", 2],
    ["Finish what you started first, then pick up the new priority.", 0],
    ["Ask what changed so you understand the reason, then switch.", 3],
    ["Switch as asked without thinking much about it.", 1]]},
  {d:'motivation', q:"A task turns out much harder than expected. What usually happens?", a:[
    ["You ask for help early so you don't lose time.", 2],
    ["You try different approaches, and ask for help if you're still stuck after a reasonable time.", 3],
    ["You switch to easier tasks and come back to it later.", 1],
    ["You mark it as blocked and wait for direction.", 0]]},
  {d:'skill', q:"How accurate are your time estimates for your own tasks, usually?", a:[
    ["Reasonably close for familiar work, less so for new work.", 2],
    ["Often off, but I adjust once I'm into the task.", 1],
    ["Usually close, and I flag early when something will take longer.", 3],
    ["I rarely estimate; I work until it's done.", 0]]},
  {d:'interest', q:"Which best describes how you feel about the kind of work you do most days?", a:[
    ["It's fine; some parts interest me more than others.", 2],
    ["I'd prefer a different type of work.", 0],
    ["I enjoy it and would choose similar work again.", 3],
    ["It's a job; I don't think much about whether I enjoy it.", 1]]},
  {d:'motivation', q:"What most often gets you to go beyond what was asked?", a:[
    ["Recognition from your lead or team.", 2],
    ["Deadlines or pressure from others.", 1],
    ["Wanting a result you're proud of.", 3],
    ["You usually stick to what was asked.", 0]]},
  {d:'attitude', q:"A project you worked on misses its goal. In the review, what are you most likely to talk about?", a:[
    ["What the team as a whole should change next time.", 2],
    ["Factors outside the team's control that made it harder.", 0],
    ["What you personally could have done differently.", 3],
    ["Whether the goal was realistic in the first place.", 1]]},
  {d:'skill', q:"When you hand over finished work, how often does it come back for fixes?", a:[
    ["Sometimes, usually for small details I missed.", 2],
    ["Rarely; I check it against the requirements before handing it over.", 3],
    ["Fairly often; reviews catch things I didn't think of.", 1],
    ["I'm not sure; I don't usually hear what happens after handover.", 0]]},
  {d:'interest', q:"If you could spend an extra hour a week on one thing, which would you pick?", a:[
    ["Improving how you do your current work.", 2],
    ["Something unrelated to your role.", 0],
    ["Going deeper into a topic in your field.", 3],
    ["Catching up on your existing tasks.", 1]]},
  {d:'attitude', q:"A colleague from another team asks for help with something outside your responsibilities during a busy week. What do you do?", a:[
    ["Help fully, even if it delays your own work.", 2],
    ["Say you're busy and suggest they ask again next week.", 1],
    ["Help briefly, or point them to someone who can.", 3],
    ["Decline, since it isn't part of your role.", 0]]},
  {d:'motivation', q:"How do you usually decide what to work towards over the next few months?", a:[
    ["You work on whatever is assigned.", 1],
    ["You set your own goals and track your progress.", 3],
    ["You don't think much beyond the current week.", 0],
    ["You agree goals with your lead and work towards them.", 2]]},
  {d:'skill', q:"A colleague asks you to explain how part of your work functions. How does that usually go?", a:[
    ["I'd need to look back through it before explaining.", 1],
    ["I can explain it clearly, including why it was done that way.", 3],
    ["I can explain what it does, but not always why.", 2],
    ["I'd rather point them to the documentation or the person who designed it.", 0]]},
  {d:'interest', q:"A colleague tells you about a new development in your field. How do you usually react?", a:[
    ["Listen, and look into it if it affects your work.", 2],
    ["Ask questions and look it up afterwards.", 3],
    ["Change the subject; it doesn't really interest you.", 0],
    ["Note it, but you probably won't follow up.", 1]]},
  {d:'attitude', q:"You're asked to follow a new process you think is less efficient than the old one. What would you most likely do?", a:[
    ["Follow it as asked without raising anything.", 2],
    ["Keep using the old way where nobody will notice.", 0],
    ["Follow it, and raise your concerns with specific examples.", 3],
    ["Follow it, but tell colleagues it's worse than before.", 1]]},
  {d:'skill', q:"You need to learn a new tool or method for your work. What usually happens?", a:[
    ["I follow tutorials until I feel ready, which can take a while.", 1],
    ["I'm productive within days by practising on a small real task.", 3],
    ["I use it, but still need regular help after a few weeks.", 0],
    ["I pick it up once someone shows me the basics.", 2]]},
  {d:'motivation', q:"After a long, demanding week, how do you usually feel about the next one?", a:[
    ["Tired, but keen to finish what's in progress.", 2],
    ["Dreading it; it's hard to get going.", 0],
    ["Ready to go; you like having plenty to work on.", 3],
    ["You need a slower week before picking up the pace.", 1]]},
  {d:'interest', q:"How would you feel about doing your current type of work two years from now?", a:[
    ["Fine, as long as the projects vary.", 2],
    ["I'd hope to be doing something different by then.", 0],
    ["Excited; there's still a lot I want to explore in it.", 3],
    ["Neutral; I haven't thought about it.", 1]]}
];

const RESPONSE_HEADERS = ['Timestamp','Employee Name','Team / Role','Attitude Score','Skill Score','Interest Score','Motivation Score','Preliminary Quadrant','Answers JSON','Examples / Notes'];

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

// Public question list: option text only, never the scores or dimension.
function getQuestions() {
  return QUESTIONS.map((item, i) => ({id: i + 1, q: item.q, a: item.a.map(opt => opt[0])}));
}

function setupSheet() {
  const ss = getSpreadsheet_();
  getResponsesSheet_(ss);
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

// Returns the Responses sheet with the current columns. A sheet left over from an older
// version of the questionnaire is renamed (kept, not deleted) and a fresh one is created.
function getResponsesSheet_(ss) {
  let sheet = ss.getSheetByName('Responses');
  if (sheet && sheet.getLastRow() > 0) {
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    if (header.join('|') === RESPONSE_HEADERS.join('|')) return sheet;
    sheet.setName('Responses (old ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') + ')');
    sheet = null;
  }
  if (!sheet) sheet = ss.insertSheet('Responses');
  sheet.getRange(1, 1, 1, RESPONSE_HEADERS.length).setValues([RESPONSE_HEADERS]);
  sheet.setFrozenRows(1);
  return sheet;
}

function submitResponse(payload) {
  if (!payload || !payload.name || !payload.answers) throw new Error('Please enter your name and answer all ' + QUESTIONS.length + ' questions.');
  const answers = payload.answers;
  if (Object.keys(answers).length !== QUESTIONS.length) throw new Error('Please answer all ' + QUESTIONS.length + ' questions.');
  QUESTIONS.forEach((q, i) => {
    const n = Number(answers[String(i + 1)]);
    if (!Number.isInteger(n) || n < 0 || n >= q.a.length) throw new Error('Invalid answer for question ' + (i + 1));
  });

  // Transparent provisional scoring: averages of self-reported choices, not a validated psychological test.
  const s = scoreDimensions_(answers);
  const quadrant = s.motivation >= 1.5
    ? (s.interest >= 1.5 ? 'Q1 — Drivers' : 'Q2 — Misaligned')
    : (s.interest >= 1.5 ? 'Q3 — Untapped Potential' : 'Q4 — Disconnected');

  const sheet = getResponsesSheet_(getSpreadsheet_());
  sheet.appendRow([
    new Date(),
    String(payload.name).trim().slice(0,120),
    String(payload.team || '').trim().slice(0,120),
    s.attitude,
    s.skill,
    s.interest,
    s.motivation,
    quadrant,
    JSON.stringify(answers),
    String(payload.notes || '').trim().slice(0,3000)
  ]);
  return {ok:true, message:'Your responses have been submitted. Thank you.'};
}

// Average option score (0..3) per dimension, rounded to 2 decimals.
function scoreDimensions_(answers) {
  const totals = {}, counts = {};
  QUESTIONS.forEach((q, i) => {
    const opt = q.a[Number(answers[String(i + 1)])];
    totals[q.d] = (totals[q.d] || 0) + opt[1];
    counts[q.d] = (counts[q.d] || 0) + 1;
  });
  const out = {};
  Object.keys(DIMENSIONS).forEach(d => out[d] = counts[d] ? Math.round(totals[d] / counts[d] * 100) / 100 : 0);
  return out;
}

function getAdminData(pin) {
  const ss = getSpreadsheet_();
  const settings = ss.getSheetByName('Settings');
  if (!settings) throw new Error('Run setupSheet() first.');
  const savedPin = String(settings.getRange('B2').getDisplayValue());
  if (!pin || String(pin) !== savedPin) throw new Error('Incorrect admin PIN.');
  // Full question list (with dimension and option scores) so the admin page can show what each person chose.
  const questions = QUESTIONS.map((item, i) => ({id: i + 1, d: DIMENSIONS[item.d], q: item.q, a: item.a}));
  const sheet = getResponsesSheet_(ss);
  if (sheet.getLastRow() < 2) return {rows:[], counts:{q1:0,q2:0,q3:0,q4:0}, total:0, questions};
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1).map((r, i) => ({
    row: i + 2,
    timestamp: r[0] instanceof Date ? Utilities.formatDate(r[0], Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') : String(r[0]),
    name: String(r[1] || ''),
    team: String(r[2] || ''),
    attitude: Number(r[3] || 0),
    skill: Number(r[4] || 0),
    interest: Number(r[5] || 0),
    motivation: Number(r[6] || 0),
    quadrant: String(r[7] || ''),
    answers: String(r[8] || '{}'),
    notes: String(r[9] || '')
  })).reverse();
  const counts = {q1:0,q2:0,q3:0,q4:0};
  rows.forEach(r => {
    if (r.quadrant.startsWith('Q1')) counts.q1++;
    else if (r.quadrant.startsWith('Q2')) counts.q2++;
    else if (r.quadrant.startsWith('Q3')) counts.q3++;
    else if (r.quadrant.startsWith('Q4')) counts.q4++;
  });
  return {rows, counts, total:rows.length, questions};
}
