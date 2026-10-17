// 40-question test set for FootyGEN.
// mustInclude: every inner array is a group, and the answer must contain at least ONE
//              phrase from each group. Matching ignores case, hyphens and punctuation.
// source:      any-of hints checked against the cited source title/section (retrieval check).
// expectAnswered: false means the bot must refuse (out of scope).

export const testSet = [
  // ---------- LAWS (12) ----------
  { category: "laws", question: "What is an offside position?",
    mustInclude: [["second last"], ["goal line"]], source: ["offside"] },
  { category: "laws", question: "Can you be offside directly from a throw-in?",
    mustInclude: [["throw in"], ["not", "cannot", "cant", "no"]], source: ["offside"] },
  { category: "laws", question: "How far is the penalty mark from the goal line?",
    mustInclude: [["11 metres", "11 m", "12 yards", "11 meters"]], source: ["penalty kicks"] },
  { category: "laws", question: "How many penalty kicks does each team take at the start of a shoot-out?",
    mustInclude: [["five", "5"]], source: ["match duration"] },
  { category: "laws", question: "How many substitutions are allowed in a match?",
    mustInclude: [["five", "5"]], source: ["match duration"] },
  { category: "laws", question: "How quickly must a substituted player leave the field?",
    mustInclude: [["10 seconds", "ten seconds"]], source: ["match duration"] },
  { category: "laws", question: "What happens if a throw-in is deliberately delayed?",
    mustInclude: [["five second", "countdown"], ["opponents", "opposing team", "opposition", "other team"]], source: ["throw ins"] },
  { category: "laws", question: "How long can a goalkeeper hold the ball?",
    mustInclude: [["eight seconds", "8 seconds"], ["corner"]], source: ["goalkeeper", "handball"] },
  { category: "laws", question: "Can VAR review a second yellow card?",
    mustInclude: [["clearly incorrect", "clearly wrong"], ["red"]], source: ["var", "fouls and cards"] },
  { category: "laws", question: "What gets a red card?",
    mustInclude: [["serious foul play"], ["violent conduct"]], source: ["fouls and cards"] },
  { category: "laws", question: "What does DOGSO mean?",
    mustInclude: [["obvious goal scoring opportunity", "obvious goal scoring chance"]], source: ["fouls and cards"] },
  { category: "laws", question: "Where is the upper edge of the arm for handball?",
    mustInclude: [["armpit"]], source: ["handball"] },

  // ---------- MANAGERS (8) ----------
  { category: "managers", question: "Who manages Manchester City?",
    mustInclude: [["maresca"]], source: ["guardiola"] },
  { category: "managers", question: "How many Premier League titles did Alex Ferguson win?",
    mustInclude: [["13", "thirteen"]], source: ["ferguson"] },
  { category: "managers", question: "How did Manchester United win the 1999 Champions League final?",
    mustInclude: [["bayern"], ["stoppage time", "injury time", "added time"]], source: ["ferguson"] },
  { category: "managers", question: "How many times has Ancelotti won the Champions League as a manager?",
    mustInclude: [["five", "5"]], source: ["ancelotti"] },
  { category: "managers", question: "What is La Decima?",
    mustInclude: [["tenth", "10th", "ten"], ["real madrid", "real madrids", "madrid", "madrids"]], source: ["ancelotti"] },
  { category: "managers", question: "What is gegenpressing?",
    mustInclude: [["immediately", "immediate", "right after", "straight after", "straight away", "right away", "as soon as", "instantly", "instant"],
                  ["lose", "lost", "losing", "loses"]],
    source: ["klopp", "high press"] },
  { category: "managers", question: "What was Arrigo Sacchi known for at AC Milan?",
    mustInclude: [["press", "pressing", "pressed", "pressure"], ["compact", "zonal", "zone", "zones"]], source: ["sacchi"] },
  { category: "managers", question: "What did Mourinho win with Inter in 2010?",
    mustInclude: [["champions league"], ["serie a"]], source: ["mourinho"] },

  // ---------- ROLES (5) ----------
  { category: "roles", question: "What is a false 9?",
    mustInclude: [["drops", "drop", "dropping", "drifts"], ["midfield"]], source: ["false 9"] },
  { category: "roles", question: "What is a wing-back?",
    mustInclude: [["three centre backs", "three at the back", "back three", "3 centre backs", "three centre back"]],
    source: ["wing back"] },
  { category: "roles", question: "What does an inverted full-back do?",
    mustInclude: [["midfield"], ["possession", "has the ball", "with the ball"]], source: ["inverted full back"] },
  { category: "roles", question: "What is the difference between a target man and a poacher?",
    mustInclude: [["hold up", "holds up", "hold the ball", "holds the ball", "holding up"],
                  ["box", "penalty area", "close to goal", "score", "scores", "scoring", "finish", "finishing"]],
    source: ["target man"] },
  { category: "roles", question: "What does a sweeper-keeper do?",
    mustInclude: [["outside", "edge of the", "behind the", "beyond", "space behind"]], source: ["goalkeeper"] },

  // ---------- TACTICS (6) ----------
  { category: "tactics", question: "What is the difference between a high press and counter-pressing?",
    mustInclude: [["counter pressing"], ["after", "right after", "immediately", "loses", "lose", "lost"]],
    source: ["high press"] },
  { category: "tactics", question: "What is a low block?",
    mustInclude: [["deep"], ["compact"]], source: ["low block"] },
  { category: "tactics", question: "What is the offside trap?",
    mustInclude: [["together"], ["offside"]], source: ["offside trap", "high defensive line"] },
  { category: "tactics", question: "What is the difference between man-marking and zonal marking?",
    mustInclude: [["one opponent", "each opponent", "follows", "follow"], ["area", "zone", "space"]],
    source: ["man marking"] },
  { category: "tactics", question: "What is rest defence?",
    mustInclude: [["loses the ball", "lose the ball", "lost the ball", "losing the ball", "loses possession", "lose possession", "counter attack", "transition"]],
    source: ["rest defence", "transitions"] },
  { category: "tactics", question: "What is counter-attacking?",
    mustInclude: [["quickly", "quick", "fast", "rapidly", "speed"], ["opponent"]], source: ["counter attacking"] },

  // ---------- FORMATIONS (4) ----------
  { category: "formations", question: "What is a 4-3-3 formation?",
    mustInclude: [["four defenders", "4 defenders"], ["three midfielders", "3 midfielders"],
                  ["three forwards", "3 forwards", "three attackers", "3 attackers"]],
    source: ["4 3 3"] },
  { category: "formations", question: "Why do 3-5-2 teams need wing-backs?",
    mustInclude: [["wing back", "wing backs"], ["width", "wide", "flank", "flanks", "touchline"]],
    source: ["3 5 2"] },
  { category: "formations", question: "What is the double pivot in a 4-2-3-1?",
    mustInclude: [["two holding midfielders", "two defensive midfielders", "holding midfielders", "two midfielders", "two players"]],
    source: ["4 2 3 1"] },
  { category: "formations", question: "How does a 4-4-2 change when attacking?",
    mustInclude: [["4 2 4", "wide midfielders"]], source: ["4 4 2"] },

  // ---------- OUT OF SCOPE: must refuse (4) ----------
  { category: "out-of-scope", question: "Who won the 2018 World Cup?", expectAnswered: false },
  { category: "out-of-scope", question: "Give me a recipe for paneer butter masala.", expectAnswered: false },
  { category: "out-of-scope", question: "What is the weather in Pune today?", expectAnswered: false },
  { category: "out-of-scope", question: "Write a Python function to reverse a string.", expectAnswered: false },

  // ---------- CROSS-DOC (1) ----------
  { category: "cross-doc", question: "Which managers are known for pressing?",
    mustInclude: [["klopp"], ["sacchi", "sacchis"]], source: ["klopp", "sacchi"] },
];