/* =========================================================
   CRICKET SIM PRO: GAME ENGINE & USER INTERFACE
   ========================================================= */

// =========================================================
// PLAYER ROSTERS (From now lets talk about building a team.txt)
// =========================================================

class Player {
    constructor(name, batting, bowling, isWicketkeeper = false) {
        this.name = name;
        this.batting = batting; // 0-100
        this.bowling = bowling; // 0-100
        this.isWicketkeeper = isWicketkeeper;
        this.resetStats();
    }

    resetStats() {
        this.runsScored = 0;
        this.ballsFaced = 0;
        this.fours = 0;
        this.sixes = 0;
        this.isOut = false;
        this.hasBatted = false;
        
        this.oversBowled = 0;
        this.ballsBowled = 0;
        this.runsConceded = 0;
        this.wickets = 0;
        this.maidens = 0;
        this.mentality = "normal"; // "defensive", "normal", "attack"
    }

    getStrikeRate() {
        if (this.ballsFaced === 0) return "0.0";
        return ((this.runsScored / this.ballsFaced) * 100).toFixed(1);
    }

    getEconomyRate() {
        const overs = this.getOversFloat();
        if (overs === 0) return "0.0";
        return (this.runsConceded / overs).toFixed(2);
    }

    getOversString() {
        const completedOvers = Math.floor(this.ballsBowled / 6);
        const remainingBalls = this.ballsBowled % 6;
        return `${completedOvers}.${remainingBalls}`;
    }

    getOversFloat() {
        return (Math.floor(this.ballsBowled / 6) + (this.ballsBowled % 6) / 6);
    }
}

// Global Team Constants
const OUR_TEAM_ROSTER = [
    new Player("Daksh Dosi", 75, 87, false),
    new Player("Shatam Rai", 80, 20, false),
    new Player("Akash Sinha", 75, 65, true), // Wicketkeeper
    new Player("Pranath V", 60, 10, false),
    new Player("Vinod Prajapati", 45, 86, false),
    new Player("Krishiv", 76, 25, false),
    new Player("Kushagra", 31, 81, false),
    new Player("Ratna Deep", 85, 79, false),
    new Player("Rohit Yadav", 15, 77, false),
    new Player("Krishna Dubey", 35, 87, false),
    new Player("Teena Naruka", 89, 69, false)
];

const OPPONENT_TEAM_ROSTER = [
    new Player("Vandan", 84, 46, false),
    new Player("Atharva Bhavesh", 72, 65, false),
    new Player("Paradox", 88, 39, false),
    new Player("Anto", 61, 78, false),
    new Player("Soumyajyoti Dey", 75, 52, false),
    new Player("Vaibhav Nagpal", 69, 81, false),
    new Player("Sai Siddhant", 83, 57, false),
    new Player("Arpita Ghosh", 66, 74, false),
    new Player("Harishkumarverma", 58, 85, false),
    new Player("Vecna", 77, 63, true), // Wicketkeeper
    new Player("Pushkal Gupta", 54, 88, false)
];

// =========================================================
// COMMENTARY DATABASE
// =========================================================
const commentaryLines = {
    "DOT": [
        "Solid defence.",
        "Beaten outside off!",
        "Tight line and length.",
        "No run there.",
        "Watchful leave.",
        "Defended straight back to the bowler."
    ],
    "1": [
        "Tucked away for a single.",
        "Keeps the scoreboard ticking.",
        "Quick run taken.",
        "Rotates strike.",
        "Easy single down to long-on.",
        "Flicked off the pads to square leg."
    ],
    "2": [
        "Good running, that's two.",
        "Back for the second!",
        "Nicely placed for a couple.",
        "Comfortable double.",
        "Pushed into the gap, quick running gets them two."
    ],
    "3": [
        "Excellent placement! Three taken.",
        "Brilliant running between wickets!",
        "They'll get three!",
        "Into the deep for three."
    ],
    "4": [
        "Races away to the boundary!",
        "Cracking shot!",
        "Pierces the gap!",
        "Beautiful timing!",
        "Cracking cover drive for four!",
        "Pulled away into the square leg fence!"
    ],
    "6": [
        "That's huge!",
        "Into the stands!",
        "Massive strike!",
        "Clears the ropes!",
        "Clean hit over long-on for SIX!",
        "Launched into orbit! Incredible shot."
    ],
    "W": [
        "He's gone! Big breakthrough!",
        "Clean bowled!",
        "Taken safely!",
        "Massive wicket!",
        "Edge and taken!",
        "Oh my lord that's a beauty!",
        "Another one departs!",
        "This is insane from this bowler!",
        "A simple catch, well taken."
    ]
};

// =========================================================
// STATE MANAGEMENT
// =========================================================

class InningsState {
    constructor(battingTeam, bowlingTeam, teamName, isUserBatting, target = null) {
        this.battingTeam = battingTeam;
        this.bowlingTeam = bowlingTeam;
        this.teamName = teamName;
        this.isUserBatting = isUserBatting;
        this.target = target;

        this.totalRuns = 0;
        this.wickets = 0;
        this.ballsBowled = 0;
        this.freeHit = false;
        this.partnershipRuns = 0;
        
        this.striker = null;
        this.nonStriker = null;
        this.currentBowler = null;
        this.lastBowler = null;

        this.ballsThisOver = 0;
        this.runsThisOver = 0;
        this.overEvents = [];
        this.recentBalls = [];
        this.overCommentary = {};
        this.fielderPositions = [
            { name: "Keeper", x: 300, y: 205, isFixed: true },
            { name: "Bowler", x: 300, y: 380, isFixed: true },
            { name: "Slip", x: 325, y: 225 },
            { name: "Point", x: 420, y: 250 },
            { name: "Cover", x: 390, y: 325 },
            { name: "Mid Off", x: 340, y: 405 },
            { name: "Mid On", x: 260, y: 405 },
            { name: "Mid Wicket", x: 210, y: 325 },
            { name: "Square Leg", x: 180, y: 250 },
            { name: "Fine Leg", x: 245, y: 205 },
            { name: "Third Man", x: 420, y: 160 }
        ];
        this.fieldingPreset = "balanced";
        
        this.isCompleted = false;
    }
}

class MatchManager {
    constructor() {
        this.format = "T20"; // "T20" or "TEST"
        this.pitch = "FLAT"; // "FLAT" or "GREEN"
        this.userTeam = "IND";
        this.oppTeam = "AUS";
        this.userWonToss = false;
        this.userBatsFirst = false;

        this.inningsList = [];
        this.currentInningsIndex = 0;
        this.isSimulatingMatch = false;
        this.isAnimating = false;
        
        this.initDOM();
    }

    initDOM() {
        // UI screens
        this.setupScreen = document.getElementById("setup-screen");
        this.openersScreen = document.getElementById("openers-screen");
        this.matchScreen = document.getElementById("match-screen");
        this.summaryScreen = document.getElementById("summary-screen");

        // Toss and Configuration inputs
        this.matchFormatSelect = document.getElementById("match-format");
        this.pitchTypeSelect = document.getElementById("pitch-type");
        this.tossHeadsBtn = document.getElementById("toss-heads");
        this.tossTailsBtn = document.getElementById("toss-tails");
        this.coin = document.getElementById("coin");
        this.tossResultText = document.getElementById("toss-result-text");
        this.tossDecisionContainer = document.getElementById("toss-decision-container");
        this.chooseBatBtn = document.getElementById("choose-bat");
        this.chooseBowlBtn = document.getElementById("choose-bowl");
        this.tabOurTeam = document.getElementById("tab-our-team");
        this.tabOppTeam = document.getElementById("tab-opp-team");
        this.rosterList = document.getElementById("roster-list");

        // Openers Selection
        this.opener1Select = document.getElementById("opener-1");
        this.opener2Select = document.getElementById("opener-2");
        this.startMatchBtn = document.getElementById("start-match-btn");

        // Dashboard outputs
        this.matchTitleUI = document.getElementById("match-title-ui");
        this.pitchReportUI = document.getElementById("pitch-report-ui");
        this.battingTeamNameUI = document.getElementById("batting-team-name-ui");
        this.battingRunsWicketsUI = document.getElementById("batting-runs-wickets-ui");
        this.battingOversUI = document.getElementById("batting-overs-ui");
        this.chaseDetailsUI = document.getElementById("chase-details-ui");
        this.matchStatusLabel = document.getElementById("match-status-label");
        this.recentBallsUI = document.getElementById("recent-balls-ui");
        this.battingScorecardTbody = document.getElementById("batting-scorecard-tbody");
        this.bowlingScorecardTbody = document.getElementById("bowling-scorecard-tbody");
        this.matchPhaseBadge = document.getElementById("match-phase-badge");

        // Live stats cards
        this.coachBattingControls = document.getElementById("coach-batting-controls");
        this.headerBattersUI = document.getElementById("header-batters-ui");

        this.uiBowlerName = document.getElementById("ui-bowler-name");
        this.uiBowlerStats = document.getElementById("ui-bowler-stats");
        this.bowlerOversLeftUI = document.getElementById("active-bowler-overs-left");

        // Fielding Controls
        this.fieldingPresetSelect = document.getElementById("fielding-preset-select");
        this.fieldingValidationBadge = document.getElementById("fielding-validation-badge");
        this.svgSectorLines = document.getElementById("svg-sector-lines");
        this.svgGapLabels = document.getElementById("svg-gap-labels");
        this.cricketField = document.getElementById("cricket-field");

        // Action Buttons
        this.simPlayBtn = document.getElementById("sim-play-btn");
        this.simBallBtn = document.getElementById("sim-ball-btn");
        this.simOverBtn = document.getElementById("sim-over-btn");
        this.clearCommentaryBtn = document.getElementById("clear-commentary");
        this.commentaryFeed = document.getElementById("commentary-feed");

        // Modals
        this.bowlerModal = document.getElementById("bowler-modal");
        this.bowlerSelectionTbody = document.getElementById("bowler-selection-tbody");
        this.modalOverNumber = document.getElementById("modal-over-number");

        this.batsmanModal = document.getElementById("batsman-modal");
        this.batsmanSelectionTbody = document.getElementById("batsman-selection-tbody");

        // Summary outputs
        this.matchWinnerText = document.getElementById("match-winner-text");
        this.summaryTabInnings1 = document.getElementById("summary-tab-innings-1");
        this.summaryTabInnings2 = document.getElementById("summary-tab-innings-2");
        this.summaryScorecardsContainer = document.getElementById("summary-scorecards-container");
        this.restartGameBtn = document.getElementById("restart-game-btn");

        // SVG elements
        this.svgFielders = document.getElementById("svg-fielders");
        this.svgBatsmen = document.getElementById("svg-batsmen");
        this.svgBall = document.getElementById("svg-ball");
        
        // Setup initial event handlers
        this.setupEvents();
        this.renderRoster("OUR");
    }

    setupEvents() {
        this.tabOurTeam.addEventListener("click", () => {
            this.tabOurTeam.classList.add("active");
            this.tabOppTeam.classList.remove("active");
            this.renderRoster("OUR");
        });

        this.tabOppTeam.addEventListener("click", () => {
            this.tabOppTeam.classList.add("active");
            this.tabOurTeam.classList.remove("active");
            this.renderRoster("OPP");
        });

        this.tossHeadsBtn.addEventListener("click", () => this.handleToss("heads"));
        this.tossTailsBtn.addEventListener("click", () => this.handleToss("tails"));

        this.chooseBatBtn.addEventListener("click", () => this.handleTossDecision("bat"));
        this.chooseBowlBtn.addEventListener("click", () => this.handleTossDecision("bowl"));

        this.startMatchBtn.addEventListener("click", () => this.startInnings());

        this.simPlayBtn.addEventListener("click", () => this.toggleMatchSimulation());
        this.simBallBtn.addEventListener("click", () => this.simulateBallCall());
        this.simOverBtn.addEventListener("click", () => this.simulateOverCall());

        this.clearCommentaryBtn.addEventListener("click", () => {
            const state = this.getCurrentState();
            if (state) {
                const select = document.getElementById("commentary-over-select");
                const currentSelected = select ? select.value : "current";
                let overToClear = 1;
                if (currentSelected === "current") {
                    overToClear = Math.floor(state.ballsBowled / 6) + 1;
                } else {
                    overToClear = parseInt(currentSelected);
                }
                state.overCommentary[overToClear] = [];
                this.renderCommentary();
            }
        });

        const overSelectEl = document.getElementById("commentary-over-select");
        if (overSelectEl) {
            overSelectEl.addEventListener("change", () => {
                this.renderCommentary();
            });
        }



        // Opener changes
        this.opener1Select.addEventListener("change", () => {
            this.updateOpenerStats(1);
            this.validateOpeners();
        });
        this.opener2Select.addEventListener("change", () => {
            this.updateOpenerStats(2);
            this.validateOpeners();
        });

        // Restart
        this.restartGameBtn.addEventListener("click", () => this.resetToSetup());

        // Fielding Preset Selector
        if (this.fieldingPresetSelect) {
            this.fieldingPresetSelect.addEventListener("change", (e) => {
                this.applyFieldingPreset(e.target.value);
            });
        }

        // Setup Drag and Drop Fielding
        this.setupFieldDragHandler();
    }

    renderRoster(team) {
        this.rosterList.innerHTML = "";
        const list = team === "OUR" ? OUR_TEAM_ROSTER : OPPONENT_TEAM_ROSTER;
        list.forEach(p => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="player-name-col">${p.name} ${p.isWicketkeeper ? '<i class="fa-solid fa-hand-holding" title="Wicketkeeper"></i>' : ''}</span>
                <span class="ratings-col">
                    <span class="bat" title="Batting Rating"><i class="fa-solid fa-gavel"></i> ${p.batting}</span>
                    <span class="bowl" title="Bowling Rating"><i class="fa-solid fa-baseball"></i> ${p.bowling}</span>
                </span>
            `;
            this.rosterList.appendChild(li);
        });
    }

    handleToss(call) {
        this.tossHeadsBtn.disabled = true;
        this.tossTailsBtn.disabled = true;
        this.matchFormatSelect.disabled = true;
        this.pitchTypeSelect.disabled = true;

        this.format = this.matchFormatSelect.value;
        const selectedPitch = this.pitchTypeSelect.value;
        this.pitch = selectedPitch === "RANDOM" ? (Math.random() > 0.5 ? "FLAT" : "GREEN") : selectedPitch;

        const tossResult = Math.random() > 0.5 ? "heads" : "tails";
        this.coin.className = "coin"; // Reset class
        
        // Triggers the CSS flip animations
        setTimeout(() => {
            this.coin.classList.add(tossResult === "heads" ? "spin-heads" : "spin-tails");
        }, 10);

        setTimeout(() => {
            this.tossResultText.textContent = `Coin landed on ${tossResult.toUpperCase()}!`;
            
            if (call === tossResult) {
                this.userWonToss = true;
                this.tossResultText.textContent += " You won the toss!";
                this.tossDecisionContainer.classList.remove("hidden");
            } else {
                this.userWonToss = false;
                const oppChoice = Math.random() > 0.5 ? "bat" : "bowl";
                this.tossResultText.textContent += ` Opponent won the toss and chooses to ${oppChoice.toUpperCase()}`;
                
                this.userBatsFirst = oppChoice === "bowl";
                setTimeout(() => {
                    this.showOpenersSelection();
                }, 2000);
            }
        }, 2100);
    }

    handleTossDecision(choice) {
        this.userBatsFirst = choice === "bat";
        this.tossDecisionContainer.classList.add("hidden");
        this.showOpenersSelection();
    }

    showOpenersSelection() {
        this.setupScreen.classList.add("hidden");
        this.openersScreen.classList.remove("hidden");

        // Initialize Roster reset
        OUR_TEAM_ROSTER.forEach(p => p.resetStats());
        OPPONENT_TEAM_ROSTER.forEach(p => p.resetStats());

        // Fill dropdown selections with batters
        this.opener1Select.innerHTML = "";
        this.opener2Select.innerHTML = "";
        
        const battingTeam = this.userBatsFirst ? OUR_TEAM_ROSTER : OPPONENT_TEAM_ROSTER;
        
        if (this.userBatsFirst) {
            // User selects openers
            battingTeam.forEach((p, idx) => {
                const opt1 = new Option(`${p.name} (Bat: ${p.batting})`, idx);
                const opt2 = new Option(`${p.name} (Bat: ${p.batting})`, idx);
                this.opener1Select.add(opt1);
                this.opener2Select.add(opt2);
            });
            this.opener2Select.selectedIndex = 1;
            this.updateOpenerStats(1);
            this.updateOpenerStats(2);
            this.validateOpeners();
        } else {
            // AI selects openers (best 2 batters)
            const sortedAI = [...battingTeam].sort((a,b) => b.batting - a.batting);
            const idx1 = battingTeam.indexOf(sortedAI[0]);
            const idx2 = battingTeam.indexOf(sortedAI[1]);
            
            const opt1 = new Option(`${sortedAI[0].name} (Bat: ${sortedAI[0].batting})`, idx1);
            const opt2 = new Option(`${sortedAI[1].name} (Bat: ${sortedAI[1].batting})`, idx2);
            this.opener1Select.add(opt1);
            this.opener2Select.add(opt2);
            this.opener1Select.disabled = true;
            this.opener2Select.disabled = true;

            const div1 = document.getElementById("opener-1-stats");
            const div2 = document.getElementById("opener-2-stats");
            div1.textContent = "AI Opener Selection";
            div2.textContent = "AI Opener Selection";
        }
    }

    updateOpenerStats(num) {
        const dropdown = num === 1 ? this.opener1Select : this.opener2Select;
        const div = document.getElementById(`opener-${num}-stats`);
        const battingTeam = this.userBatsFirst ? OUR_TEAM_ROSTER : OPPONENT_TEAM_ROSTER;
        const player = battingTeam[dropdown.value];
        if (player) {
            div.textContent = `Batting: ${player.batting} | Bowling: ${player.bowling}`;
        }
    }

    validateOpeners() {
        if (this.opener1Select.value === this.opener2Select.value) {
            this.startMatchBtn.disabled = true;
            this.startMatchBtn.textContent = "Choose different openers";
            this.startMatchBtn.style.opacity = 0.5;
        } else {
            this.startMatchBtn.disabled = false;
            this.startMatchBtn.textContent = "Start Innings";
            this.startMatchBtn.style.opacity = 1;
        }
    }

    startInnings() {
        this.openersScreen.classList.add("hidden");
        this.matchScreen.classList.remove("hidden");

        const battingTeam = this.userBatsFirst ? OUR_TEAM_ROSTER : OPPONENT_TEAM_ROSTER;
        const bowlingTeam = this.userBatsFirst ? OPPONENT_TEAM_ROSTER : OUR_TEAM_ROSTER;

        // Reset innings states
        this.inningsList = [];
        this.currentInningsIndex = 0;

        if (this.format === "T20") {
            const state1 = new InningsState(battingTeam, bowlingTeam, this.userBatsFirst ? "IND 1st" : "AUS 1st", this.userBatsFirst);
            this.inningsList.push(state1);
        } else {
            // TEST format - 4 Innings
            const state1 = new InningsState(battingTeam, bowlingTeam, this.userBatsFirst ? "IND 1st" : "AUS 1st", this.userBatsFirst);
            this.inningsList.push(state1);
        }

        const state = this.getCurrentState();
        
        // Assign openers
        const op1Idx = parseInt(this.opener1Select.value);
        const op2Idx = parseInt(this.opener2Select.value);
        state.striker = state.battingTeam[op1Idx];
        state.nonStriker = state.battingTeam[op2Idx];
        state.striker.hasBatted = true;
        state.nonStriker.hasBatted = true;

        if (state.isUserBatting) {
            state.striker.mentality = document.getElementById("opener-1-mentality").value;
            state.nonStriker.mentality = document.getElementById("opener-2-mentality").value;
        } else {
            state.striker.mentality = "normal";
            state.nonStriker.mentality = "normal";
        }

        this.logCommentary("Match", `Match starts! Format: ${this.format} | Pitch: ${this.pitch.toUpperCase()}`, "welcome");
        this.logCommentary("Toss", `${this.userWonToss ? 'You' : 'Opponent'} won the toss and elected to ${this.userBatsFirst ? 'Bat' : 'Bowl'} first.`, "welcome");
        this.logCommentary("Innings", `Innings 1: ${state.teamName} starts batting. Openers: ${state.striker.name} & ${state.nonStriker.name}.`, "welcome");

        this.pitchReportUI.textContent = `Pitch: ${this.pitch.toUpperCase()}`;
        this.matchTitleUI.textContent = `${this.userBatsFirst ? 'IND vs AUS' : 'AUS vs IND'} - ${this.format}`;

        this.drawField();
        this.triggerBowlerSelection();
    }

    getCurrentState() {
        return this.inningsList[this.currentInningsIndex];
    }

    // =========================================================
    // FIELD GRAPHICS (SVG) RENDERING
    // =========================================================
    drawField() {
        const state = this.getCurrentState();
        if (!state) return;

        // Colors
        const batColor = "#60A5FA"; // Blue for IND
        const bowlColor = "#EF4444"; // Red for AUS
        
        const batterFill = state.isUserBatting ? batColor : bowlColor;
        const fielderFill = state.isUserBatting ? bowlColor : batColor;

        // Render Batsmen
        // Striker at top (300, 240), Non-striker at bottom (300, 360)
        this.svgBatsmen.innerHTML = `
            <!-- Striker -->
            <g transform="translate(300, 240)">
                <circle r="7" fill="${batterFill}" stroke="#fff" stroke-width="1.5" class="pulsate-node" />
                <text y="-12" text-anchor="middle" fill="#fff" font-size="9" font-weight="600">${state.striker ? this.getInitials(state.striker.name) : 'STR'}*</text>
            </g>
            <!-- Non Striker -->
            <g transform="translate(300, 360)">
                <circle r="7" fill="${batterFill}" stroke="#fff" stroke-width="1.5" />
                <text y="-12" text-anchor="middle" fill="#fff" font-size="9" font-weight="600">${state.nonStriker ? this.getInitials(state.nonStriker.name) : 'NON'}</text>
            </g>
        `;

        // Render Fielders using state positions
        let fieldersHTML = "";
        state.fielderPositions.forEach((pos, index) => {
            let label = pos.name;
            if (pos.name === "Bowler" && state.currentBowler) {
                label = this.getInitials(state.currentBowler.name);
            } else if (pos.name === "Keeper") {
                const keeper = state.bowlingTeam.find(p => p.isWicketkeeper);
                label = keeper ? this.getInitials(keeper.name) : "WK";
            }
            
            fieldersHTML += `
                <g class="${pos.isFixed ? '' : 'draggable-fielder'}" data-idx="${index}" transform="translate(${pos.x}, ${pos.y})">
                    <circle r="6.5" fill="${fielderFill}" stroke="#fff" stroke-width="1" />
                    <text y="14" text-anchor="middle" fill="${pos.name === 'Bowler' ? '#F59E0B' : '#9CA3AF'}" font-size="8" font-weight="bold">${label}</text>
                </g>
            `;
        });
        this.svgFielders.innerHTML = fieldersHTML;

        // Render sector lines & gap badges
        this.renderSectorGaps(state);
    }

    getInitials(name) {
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }

    // =========================================================
    // BALL SIMULATION & CALCULATIONS
    // =========================================================
    
    getProbabilities(over, batsman, bowler, freeHit) {
        const diff = batsman.batting - bowler.bowling;

        // Base Probabilities
        let probs = {
            "DOT": 30,
            "1": 28,
            "2": 14,
            "3": 3,
            "4": 10,
            "6": 5,
            "W": 8,
            "WIDE": 1,
            "NO BALL": 1
        };

        if (this.format === "T20") {
            // Stage Adjustments
            if (over <= 6) {
                probs["4"] += 5;
                probs["6"] += 2;
            } else if (over >= 16) {
                probs["4"] += 12;
                probs["6"] += 12;
                probs["W"] += 5;
                probs["DOT"] = Math.max(5, probs["DOT"] - 10);
            }
        } else {
            // TEST format probabilities (from testsim1.py)
            if (this.pitch === "FLAT") {
                probs = { "DOT": 120, "1": 45, "2": 15, "3": 2, "4": 12, "6": 1, "W": 5, "WIDE": 0.5, "NO BALL": 0.5 };
            } else {
                // GREEN pitch (harder to bat)
                probs = { "DOT": 150, "1": 35, "2": 8, "3": 1, "4": 6, "6": 0, "W": 12, "WIDE": 0.5, "NO BALL": 0.5 };
            }
        }

        // Skill differences modification
        if (diff >= 30) {
            probs["4"] += 25;
            probs["6"] += 20;
            probs["W"] = Math.max(0.5, probs["W"] - 6);
            probs["DOT"] = Math.max(5, probs["DOT"] - 15);
        } else if (diff >= 15) {
            probs["4"] += 12;
            probs["6"] += 8;
            probs["W"] = Math.max(1, probs["W"] - 4);
        } else if (diff <= -30) {
            probs["W"] += 15;
            probs["DOT"] += 30;
            probs["4"] = Math.max(0, probs["4"] - 8);
            probs["6"] = 0;
        } else if (diff <= -15) {
            probs["W"] += 6;
            probs["DOT"] += 12;
            probs["4"] = Math.max(1, probs["4"] - 5);
        }

        // Mentality adjustments
        if (batsman.mentality === "attack") {
            probs["4"] += 10;
            probs["6"] += 8;
            probs["W"] += 4;
            probs["DOT"] = Math.max(2, probs["DOT"] - 12);
        } else if (batsman.mentality === "defensive") {
            probs["DOT"] += 25;
            probs["4"] = Math.max(0, probs["4"] - 8);
            probs["6"] = Math.max(0, probs["6"] - 4);
            probs["W"] = Math.max(0.5, probs["W"] - 4);
        }

        // Free Hit eliminates Wicket
        if (freeHit) {
            probs["W"] = 0;
            probs["4"] += 15;
            probs["6"] += 20;
            probs["DOT"] = Math.max(2, probs["DOT"] - 15);
        }

        // SPATIAL FIELDING MODIFIER (Blended Composure & Sector Gaps)
        const state = this.getCurrentState();
        if (state && state.fielderPositions) {
            const activeFielders = state.fielderPositions.filter(f => !f.isFixed);
            
            if (activeFielders.length >= 2) {
                // Calculate polar angles relative to striker
                const fieldersWithAngles = activeFielders.map(f => {
                    const dx = f.x - 300;
                    const dy = f.y - 240;
                    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    if (angle < 0) angle += 360;
                    return { ...f, angle };
                });

                // Sort by angle
                fieldersWithAngles.sort((a, b) => a.angle - b.angle);

                // Find gaps (9 sectors)
                const sectors = [];
                for (let i = 0; i < fieldersWithAngles.length; i++) {
                    const f1 = fieldersWithAngles[i];
                    const f2 = fieldersWithAngles[(i + 1) % fieldersWithAngles.length];

                    let gap = f2.angle - f1.angle;
                    if (gap < 0) gap += 360;

                    let midAngle = f1.angle + gap / 2;
                    if (midAngle >= 360) midAngle -= 360;

                    const f1DistCenter = Math.sqrt((f1.x - 300)**2 + (f1.y - 300)**2);
                    const f2DistCenter = Math.sqrt((f2.x - 300)**2 + (f2.y - 300)**2);
                    const isDeepCovered = f1DistCenter > 160 || f2DistCenter > 160;

                    sectors.push({
                        start: f1.angle,
                        end: f2.angle,
                        gapSize: gap,
                        midAngle: midAngle,
                        isDeepCovered: isDeepCovered
                    });
                }

                // Sort gaps by size descending
                const sortedGaps = [...sectors].sort((a, b) => b.gapSize - a.gapSize);
                
                // Batsman target selection based on skill and mentality
                const skillFactor = Math.min(0.95, batsman.batting / 100);
                const mentalityFactor = batsman.mentality === "attack" ? 0.9 : (batsman.mentality === "normal" ? 0.6 : 0.3);
                const gapPierceProbability = skillFactor * mentalityFactor;

                let chosenSector = null;
                if (Math.random() < gapPierceProbability) {
                    // Pierce the largest gaps
                    const gapChoice = Math.floor(Math.random() * Math.min(3, sortedGaps.length));
                    chosenSector = sortedGaps[gapChoice];
                } else {
                    // Random placement (straight to fielders)
                    chosenSector = sectors[Math.floor(Math.random() * sectors.length)];
                }

                if (chosenSector) {
                    const gap = chosenSector.gapSize;
                    const isDeep = chosenSector.isDeepCovered;

                    if (gap < 25) {
                        // Narrow inner gap (Closed inside)
                        if (!isDeep) {
                            // Open deep: high risk of catches but high boundary reward
                            if (batsman.mentality === "attack") {
                                probs["W"] += 3;
                                probs["4"] += 5;
                                probs["DOT"] = Math.max(2, probs["DOT"] - 4);
                            } else {
                                probs["DOT"] += 8;
                                probs["1"] = Math.max(2, probs["1"] - 4);
                                probs["4"] = Math.max(0, probs["4"] - 3);
                            }
                        } else {
                            // Closed deep: high risk of dot/catch, low boundaries
                            probs["DOT"] += 12;
                            probs["W"] += 2;
                            probs["4"] = Math.max(0, probs["4"] - 5);
                            probs["6"] = Math.max(0, probs["6"] - 3);
                        }
                    } else if (gap >= 35) {
                        // Wide gap (Open inside)
                        if (isDeep) {
                            // Covered deep: easy singles/doubles, low boundary
                            probs["1"] += 15;
                            probs["2"] += 8;
                            probs["DOT"] = Math.max(2, probs["DOT"] - 10);
                            probs["4"] = Math.max(1, probs["4"] - 6);
                            probs["W"] = Math.max(0.5, probs["W"] - 3);
                        } else {
                            // Open deep: boundary bonanza, low wicket
                            probs["4"] += 12;
                            probs["6"] += 6;
                            probs["DOT"] = Math.max(2, probs["DOT"] - 8);
                            probs["W"] = Math.max(0.5, probs["W"] - 4);
                        }
                    } else {
                        // Moderate gap
                        if (isDeep) {
                            probs["1"] += 5;
                            probs["DOT"] += 3;
                        } else {
                            probs["2"] += 4;
                            probs["4"] += 3;
                        }
                    }
                }
            }
        }

        return probs;
    }

    chooseOutcome(probs) {
        let total = 0;
        for (const k in probs) {
            total += probs[k];
        }

        const rand = Math.random() * total;
        let cumulative = 0;
        for (const k in probs) {
            cumulative += probs[k];
            if (rand <= cumulative) {
                return k;
            }
        }
        return "DOT";
    }

    simulateBallCall() {
        if (this.isAnimating) return;
        const state = this.getCurrentState();
        if (!state || state.isCompleted) return;

        this.isAnimating = true;
        this.disableActions(true);

        const overNum = Math.floor(state.ballsBowled / 6) + 1;
        const probs = this.getProbabilities(overNum, state.striker, state.currentBowler, state.freeHit);
        const result = this.chooseOutcome(probs);

        // SVG animation values
        let targetX = 300;
        let targetY = 205; // Default keeper
        let animType = "DOT";

        if (result === "WIDE" || result === "NO BALL") {
            animType = "EXTRA";
            targetX = result === "WIDE" ? 275 : 300;
            targetY = 240;
        } else if (result === "W") {
            animType = "WICKET";
            const catchOut = Math.random() > 0.4;
            if (catchOut) {
                // flies to a fielder (inverted positions)
                const positions = [
                    { x: 325, y: 225 }, // Slip
                    { x: 420, y: 250 }, // Point
                    { x: 390, y: 325 }, // Cover
                    { x: 210, y: 325 }  // Mid Wicket
                ];
                const selectedPos = positions[Math.floor(Math.random() * positions.length)];
                targetX = selectedPos.x;
                targetY = selectedPos.y;
            } else {
                // bowled
                targetX = 300;
                targetY = 236; // hits top stumps
            }
        } else if (result === "DOT") {
            animType = "DOT";
            targetX = 300;
            targetY = 205; // wicket keeper
        } else {
            // runs
            const runs = parseInt(result);
            animType = runs === 4 ? "FOUR" : (runs === 6 ? "SIX" : "RUNS");
            
            // Random direction in the field
            const angle = Math.random() * 2 * Math.PI;
            const distance = runs === 4 ? 285 : (runs === 6 ? 315 : 180 + Math.random() * 80);
            
            targetX = 300 + Math.cos(angle) * distance;
            targetY = 300 + Math.sin(angle) * distance;
        }

        this.animateBall(targetX, targetY, animType, () => {
            this.processBallOutcome(result);
        });
    }

    animateBall(targetX, targetY, type, callback) {
        this.svgBall.style.display = "block";
        
        // Bowler starts delivery at bottom (300, 380)
        // Striker stands at top (300, 240)
        this.svgBall.setAttribute("cx", 300);
        this.svgBall.setAttribute("cy", 380);
        this.svgBall.setAttribute("r", 5.5);

        // Step 1: Bowl to striker at y=240 (250ms)
        this.animateElement(this.svgBall, { cy: 240 }, 250, () => {
            // Step 2: Hit to target (350ms)
            let duration = 350;
            let animProps = { cx: targetX, cy: targetY };
            
            if (type === "SIX") {
                // parabolic scale arc
                let steps = 15;
                let currentStep = 0;
                const startX = 300;
                const startY = 240;

                const arcInterval = setInterval(() => {
                    currentStep++;
                    const progress = currentStep / steps;
                    const cx = startX + (targetX - startX) * progress;
                    const cy = startY + (targetY - startY) * progress;
                    // Height parabola
                    const h = Math.sin(progress * Math.PI) * 12; 
                    
                    this.svgBall.setAttribute("cx", cx);
                    this.svgBall.setAttribute("cy", cy);
                    this.svgBall.setAttribute("r", 5.5 + h);

                    if (currentStep >= steps) {
                        clearInterval(arcInterval);
                        this.triggerFlashEffects(type);
                        callback();
                    }
                }, 350 / steps);
            } else {
                // Linear flight
                this.animateElement(this.svgBall, animProps, duration, () => {
                    this.triggerFlashEffects(type);
                    callback();
                });
            }
        });
    }

    animateElement(element, properties, duration, onComplete) {
        const start = performance.now();
        const startState = {};
        for (const prop in properties) {
            startState[prop] = parseFloat(element.getAttribute(prop)) || 0;
        }

        const step = (timestamp) => {
            const progress = Math.min((timestamp - start) / duration, 1);
            
            for (const prop in properties) {
                const startVal = startState[prop];
                const endVal = properties[prop];
                element.setAttribute(prop, startVal + (endVal - startVal) * progress);
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                onComplete();
            }
        };

        requestAnimationFrame(step);
    }

    triggerFlashEffects(type) {
        this.svgBall.style.display = "none";
        const overlayText = document.getElementById("field-overlay-text");
        
        if (type === "FOUR") {
            const flash = document.getElementById("four-flash");
            flash.classList.add("active");
            document.getElementById("cricket-field").classList.add("screen-shake");
            overlayText.textContent = "FOUR!";
            overlayText.style.fill = "#10B981";
            overlayText.style.display = "block";
            
            setTimeout(() => {
                flash.classList.remove("active");
                document.getElementById("cricket-field").classList.remove("screen-shake");
                overlayText.style.display = "none";
            }, 1000);
        } else if (type === "SIX") {
            const flash = document.getElementById("six-flash");
            flash.classList.add("active");
            document.getElementById("cricket-field").classList.add("screen-shake");
            overlayText.textContent = "SIX!";
            overlayText.style.fill = "#F59E0B";
            overlayText.style.display = "block";

            setTimeout(() => {
                flash.classList.remove("active");
                document.getElementById("cricket-field").classList.remove("screen-shake");
                overlayText.style.display = "none";
            }, 1000);
        } else if (type === "WICKET") {
            const flash = document.getElementById("wicket-flash");
            flash.classList.add("active");
            overlayText.textContent = "OUT!";
            overlayText.style.fill = "#EF4444";
            overlayText.style.display = "block";

            setTimeout(() => {
                flash.classList.remove("active");
                overlayText.style.display = "none";
            }, 1000);
        }
    }

    processBallOutcome(result) {
        const state = this.getCurrentState();
        if (!state) return;

        let legal = true;
        let commentaryMsg = "";
        let eventCode = result;

        if (result === "WIDE") {
            state.totalRuns += 1;
            state.runsThisOver += 1;
            state.partnershipRuns += 1; // Increment partnership
            state.overEvents.push("Wd");
            state.recentBalls.push("Wd");
            commentaryMsg = "Wide ball down the leg side, extra run conceded.";
            legal = false;
        } else if (result === "NO BALL") {
            state.totalRuns += 1;
            state.runsThisOver += 1;
            state.partnershipRuns += 1; // Increment partnership
            state.freeHit = true;
            state.overEvents.push("Nb");
            state.recentBalls.push("Nb");
            commentaryMsg = "No ball! Bowler overstepped the crease. Free hit coming up!";
            legal = false;
        } else {
            // Legal ball
            state.ballsBowled += 1;
            state.ballsThisOver += 1;
            state.freeHit = false;
            state.striker.ballsFaced += 1;
            state.currentBowler.ballsBowled += 1;

            if (result === "DOT") {
                state.overEvents.push("0");
                state.recentBalls.push("0");
                commentaryMsg = commentaryLines.DOT[Math.floor(Math.random() * commentaryLines.DOT.length)];
                eventCode = "•";
            } else if (result === "W") {
                state.wickets += 1;
                state.striker.isOut = true;
                state.currentBowler.wickets += 1;
                state.partnershipRuns = 0; // Reset partnership on wicket down
                state.overEvents.push("W");
                state.recentBalls.push("W");
                
                commentaryMsg = `${state.striker.name} departs! ` + commentaryLines.W[Math.floor(Math.random() * commentaryLines.W.length)];
                commentaryMsg += ` Out for ${state.striker.runsScored} (${state.striker.ballsFaced} balls).`;
                eventCode = "W";
            } else {
                const runs = parseInt(result);
                state.totalRuns += runs;
                state.runsThisOver += runs;
                state.partnershipRuns += runs; // Increment partnership
                
                state.striker.runsScored += runs;
                state.currentBowler.runsConceded += runs;
                
                if (runs === 4) {
                    state.striker.fours += 1;
                } else if (runs === 6) {
                    state.striker.sixes += 1;
                }

                state.overEvents.push(result);
                state.recentBalls.push(result);
                commentaryMsg = commentaryLines[result][Math.floor(Math.random() * commentaryLines[result].length)];
                eventCode = result;

                // Strike rotation
                if (runs % 2 === 1) {
                    this.rotateStrike();
                }
            }
        }

        // Limit recent balls queue to 12
        if (state.recentBalls.length > 12) {
            state.recentBalls.shift();
        }

        // Record log item
        const overString = `${Math.floor((state.ballsBowled - (legal ? 1 : 0)) / 6)}.${state.ballsThisOver - (legal ? 0 : 0)}`;
        this.logCommentary(overString, commentaryMsg, eventCode);

        // Update graphics and UI
        this.updateUI();

        // Check Innings/Match limits
        const isTargetChased = state.target && state.totalRuns >= state.target;
        const isAllOut = state.wickets >= 10;
        const isOversCompleted = this.format === "T20" && state.ballsBowled >= 120;

        if (isTargetChased || isAllOut || isOversCompleted) {
            this.handleInningsCompletion();
            return;
        }

        // Over end logic
        if (legal && state.ballsBowled % 6 === 0) {
            this.handleOverEnd();
            return;
        }

        // Striker dismissed logic
        if (result === "W") {
            this.triggerBatsmanSelection();
            return;
        }

        // Resume simulator controls
        this.isAnimating = false;
        this.disableActions(false);

        // Continuous simulation check
        if (this.isSimulatingMatch) {
            this.autoplayTimer = setTimeout(() => this.simulateBallCall(), 1500);
        }
    }

    rotateStrike() {
        const state = this.getCurrentState();
        if (state) {
            const temp = state.striker;
            state.striker = state.nonStriker;
            state.nonStriker = temp;
            this.drawField();
        }
    }

    handleOverEnd() {
        const state = this.getCurrentState();
        if (!state) return;

        // Check if maiden over
        if (state.runsThisOver === 0 && state.overEvents.indexOf("Wd") === -1 && state.overEvents.indexOf("Nb") === -1) {
            state.currentBowler.maidens += 1;
            this.logCommentary(`End of Over`, `Maiden over! Brilliant spell from ${state.currentBowler.name}.`, "over-conclusion-item");
        } else {
            this.logCommentary(`End of Over`, `Runs this over: ${state.runsThisOver} | Score: ${state.totalRuns}/${state.wickets}`, "over-conclusion-item");
        }

        // Bowler ends over
        state.currentBowler.oversBowled = Math.floor(state.currentBowler.ballsBowled / 6);
        state.lastBowler = state.currentBowler;
        state.currentBowler = null;

        // Push over separator to recent list
        state.recentBalls.push("|");

        // Strike rotation at end of over
        this.rotateStrike();

        state.ballsThisOver = 0;
        state.runsThisOver = 0;
        state.overEvents = [];

        // Auto-reset commentary view to the active over
        const select = document.getElementById("commentary-over-select");
        if (select) {
            select.value = "current";
        }

        this.isAnimating = false;
        this.triggerBowlerSelection();
    }

    // =========================================================
    // MODALS: tactial selections
    // =========================================================

    triggerBowlerSelection() {
        const state = this.getCurrentState();
        if (!state) return;

        // If User is batting (AI is bowling), select bowler automatically
        if (state.isUserBatting) {
            this.selectAIBowler();
            return;
        }

        // User is bowling: Pause simulation to select bowler
        this.pauseMatchSimulation("Select Bowler");

        this.modalOverNumber.textContent = Math.floor(state.ballsBowled / 6) + 1;
        this.bowlerSelectionTbody.innerHTML = "";

        // Filter available bowlers (max 4 overs limit in T20, can't bowl consecutive)
        const available = state.bowlingTeam.filter(p => {
            const consec = p === state.lastBowler;
            const t20Limit = this.format === "T20" && (p.ballsBowled >= 24);
            return !consec && !t20Limit;
        });

        // If no bowler available, allow any except last
        const selectionList = available.length > 0 ? available : state.bowlingTeam.filter(p => p !== state.lastBowler);

        selectionList.forEach((p, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${p.name}</strong></td>
                <td>${p.bowling}</td>
                <td>${p.getOversString()}</td>
                <td>${p.runsConceded}</td>
                <td>${p.wickets}</td>
                <td><button class="btn btn-primary select-bowl-btn" data-idx="${state.bowlingTeam.indexOf(p)}">Select</button></td>
            `;
            this.bowlerSelectionTbody.appendChild(tr);
        });

        this.bowlerModal.classList.remove("hidden");

        // Event listener
        const buttons = this.bowlerSelectionTbody.querySelectorAll(".select-bowl-btn");
        buttons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = parseInt(e.currentTarget.dataset.idx);
                state.currentBowler = state.bowlingTeam[idx];
                this.bowlerModal.classList.add("hidden");
                this.logCommentary("Select Bowler", `${state.currentBowler.name} comes on to bowl over ${Math.floor(state.ballsBowled/6)+1}.`, "welcome");
                this.updateUI();
                this.drawField();
                
                this.isAnimating = false;
                this.disableActions(false);

                // Resume auto-simulation if active
                if (this.isSimulatingMatch) {
                    this.autoplayTimer = setTimeout(() => this.simulateBallCall(), 1500);
                }
            });
        });
    }

    getStrategicAIBowler(state) {
        // Respect consecutive overs and over caps (T20 max 4 overs, or 24 balls)
        const available = state.bowlingTeam.filter(p => {
            const consec = p === state.lastBowler;
            const t20Limit = this.format === "T20" && (p.ballsBowled >= 24);
            return !consec && !t20Limit;
        });

        if (available.length === 0) {
            return state.bowlingTeam.find(p => p !== state.lastBowler) || state.bowlingTeam[0];
        }

        const overNum = Math.floor(state.ballsBowled / 6) + 1;

        // 1. Partnership Breaker Override (runs >= 35)
        if (state.partnershipRuns >= 35) {
            const bestBowler = [...available].sort((a,b) => b.bowling - a.bowling)[0];
            return bestBowler;
        }

        if (this.format === "T20") {
            // 2. Powerplay (Overs 1-6)
            if (overNum <= 6) {
                const sortedBowlers = [...state.bowlingTeam].sort((a,b) => b.bowling - a.bowling);
                const openersList = sortedBowlers.slice(0, 3);
                
                const availableOpeners = available.filter(p => openersList.includes(p));
                if (availableOpeners.length > 0) {
                    return availableOpeners.sort((a,b) => a.ballsBowled - b.ballsBowled)[0];
                }
            }

            // 3. Death Overs (Overs 16-20)
            if (overNum >= 16) {
                const sortedBowlers = [...state.bowlingTeam].sort((a,b) => b.bowling - a.bowling);
                const deathSpecialists = sortedBowlers.slice(0, 2);
                
                const availableDeath = available.filter(p => deathSpecialists.includes(p));
                if (availableDeath.length > 0) {
                    return availableDeath.sort((a,b) => a.ballsBowled - b.ballsBowled)[0];
                }
            }

            // 4. Middle Overs (Overs 7-15)
            // Use secondary/supporting bowlers (ratings rank 4 to 8) to preserve opening/death bowlers
            const sortedBowlers = [...state.bowlingTeam].sort((a,b) => b.bowling - a.bowling);
            const midSpecialists = sortedBowlers.slice(3, 8);
            
            const availableMid = available.filter(p => midSpecialists.includes(p));
            if (availableMid.length > 0) {
                return availableMid.sort((a,b) => a.ballsBowled - b.ballsBowled)[0];
            }
        } else {
            // Test Match bowler rotation
            const sortedBowlers = [...state.bowlingTeam].sort((a,b) => b.bowling - a.bowling);
            const mainBowlers = sortedBowlers.slice(0, 5);
            const availableMain = available.filter(p => mainBowlers.includes(p));
            
            if (availableMain.length > 0) {
                return availableMain.sort((a,b) => a.ballsBowled - b.ballsBowled)[0];
            }
        }

        // Fallback: choose highest rated bowler
        return [...available].sort((a,b) => b.bowling - a.bowling)[0];
    }

    selectAIBowler() {
        const state = this.getCurrentState();
        const selected = this.getStrategicAIBowler(state);
        
        state.currentBowler = selected;
        this.logCommentary("AI Bowling Change", `Opponent coach brings on ${state.currentBowler.name} to bowl.`, "welcome");
        
        this.updateUI();
        this.drawField();
        
        this.isAnimating = false;
        this.disableActions(false);

        // Resume continuous simulation if enabled
        if (this.isSimulatingMatch) {
            this.autoplayTimer = setTimeout(() => this.simulateBallCall(), 1500);
        }
    }

    triggerBatsmanSelection() {
        const state = this.getCurrentState();
        if (!state) return;

        // If AI is batting, select next batsman automatically
        if (state.isUserBatting) {
            this.pauseMatchSimulation("Wicket Down");

            this.batsmanSelectionTbody.innerHTML = "";
            const unbatted = state.battingTeam.filter(p => !p.hasBatted && !p.isOut);

            unbatted.forEach(p => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${p.name}</strong></td>
                    <td>${p.batting}</td>
                    <td>
                        <select class="player-dropdown modal-mentality-select" style="width: auto; padding: 6px;">
                            <option value="defensive">Defensive</option>
                            <option value="normal" selected>Balanced</option>
                            <option value="attack">Aggressive</option>
                        </select>
                    </td>
                    <td><button class="btn btn-primary select-bat-btn" data-idx="${state.battingTeam.indexOf(p)}">Walk In</button></td>
                `;
                this.batsmanSelectionTbody.appendChild(tr);
            });

            this.batsmanModal.classList.remove("hidden");

            const buttons = this.batsmanSelectionTbody.querySelectorAll(".select-bat-btn");
            buttons.forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const idx = parseInt(e.currentTarget.dataset.idx);
                    const selected = state.battingTeam[idx];
                    
                    const selectEl = e.currentTarget.closest("tr").querySelector(".modal-mentality-select");
                    selected.mentality = selectEl.value;

                    selected.hasBatted = true;
                    state.striker = selected;
                    
                    this.batsmanModal.classList.add("hidden");
                    this.logCommentary("Select Batter", `${state.striker.name} walks out to the crease under pressure with ${selected.mentality.toUpperCase()} mentality.`, "welcome");
                    this.updateUI();
                    this.drawField();

                    this.isAnimating = false;
                    this.disableActions(false);
                });
            });
        } else {
            // AI Select batsman (select highest rated unbatted batsman)
            const unbatted = state.battingTeam.filter(p => !p.hasBatted && !p.isOut);
            const selected = unbatted.sort((a,b) => b.batting - a.batting)[0];
            
            selected.hasBatted = true;
            selected.mentality = "normal";
            state.striker = selected;
            
            this.logCommentary("AI Batting Change", `${state.striker.name} comes in next to bat.`, "welcome");
            
            this.updateUI();
            this.drawField();

            this.isAnimating = false;
            this.disableActions(false);

            // Resume continuous simulation if enabled
            if (this.isSimulatingMatch) {
                this.autoplayTimer = setTimeout(() => this.simulateBallCall(), 1500);
            }
        }
    }

    // =========================================================
    // INNINGS & MATCH WRAP UP
    // =========================================================

    handleInningsCompletion() {
        const state = this.getCurrentState();
        state.isCompleted = true;
        this.logCommentary("Innings Complete", `Innings complete! ${state.teamName} finish with ${state.totalRuns}/${state.wickets}.`, "over-conclusion-item");

        this.pauseMatchSimulation("Innings Completed");

        if (this.format === "T20") {
            if (this.currentInningsIndex === 0) {
                // Trigger 2nd innings setup
                this.logCommentary("Match Update", `Target set: ${state.totalRuns + 1} runs needed.`, "welcome");
                
                const nextBattingTeam = this.userBatsFirst ? OPPONENT_TEAM_ROSTER : OUR_TEAM_ROSTER;
                const nextBowlingTeam = this.userBatsFirst ? OUR_TEAM_ROSTER : OPPONENT_TEAM_ROSTER;
                const state2 = new InningsState(nextBattingTeam, nextBowlingTeam, this.userBatsFirst ? "AUS 2nd" : "IND 2nd", !this.userBatsFirst, state.totalRuns + 1);
                
                this.inningsList.push(state2);
                this.currentInningsIndex = 1;

                // Set default openers for Innings 2 (AI chooses best, user chooses in dialog)
                if (state2.isUserBatting) {
                    this.showSecondInningsOpenerSelection();
                } else {
                    const sortedAI = [...state2.battingTeam].sort((a,b) => b.batting - a.batting);
                    state2.striker = sortedAI[0];
                    state2.nonStriker = sortedAI[1];
                    state2.striker.hasBatted = true;
                    state2.nonStriker.hasBatted = true;
                    
                    this.logCommentary("Innings 2", `Innings 2 starts. Target is ${state2.target}. Opponent openers: ${state2.striker.name} & ${state2.nonStriker.name}.`, "welcome");
                    this.updateUI();
                    this.drawField();
                    this.triggerBowlerSelection();
                }
            } else {
                // T20 Match Complete
                this.showSummaryScreen();
            }
        } else {
            // TEST Match Flow (4 Innings total)
            if (this.currentInningsIndex < 3) {
                this.setupNextTestInnings();
            } else {
                this.showSummaryScreen();
            }
        }
    }

    showSecondInningsOpenerSelection() {
        // Simple alert/prompt or modal
        this.openersScreen.classList.remove("hidden");
        this.matchScreen.classList.add("hidden");

        const battingTeam = OUR_TEAM_ROSTER;
        this.opener1Select.innerHTML = "";
        this.opener2Select.innerHTML = "";
        this.opener1Select.disabled = false;
        this.opener2Select.disabled = false;
        
        battingTeam.forEach((p, idx) => {
            const opt1 = new Option(`${p.name} (Bat: ${p.batting})`, idx);
            const opt2 = new Option(`${p.name} (Bat: ${p.batting})`, idx);
            this.opener1Select.add(opt1);
            this.opener2Select.add(opt2);
        });
        this.opener2Select.selectedIndex = 1;
        this.validateOpeners();
        
        this.startMatchBtn.onclick = () => {
            this.openersScreen.classList.add("hidden");
            this.matchScreen.classList.remove("hidden");

            const state2 = this.inningsList[1];
            const op1Idx = parseInt(this.opener1Select.value);
            const op2Idx = parseInt(this.opener2Select.value);
            state2.striker = state2.battingTeam[op1Idx];
            state2.nonStriker = state2.battingTeam[op2Idx];
            state2.striker.hasBatted = true;
            state2.nonStriker.hasBatted = true;

            state2.striker.mentality = document.getElementById("opener-1-mentality").value;
            state2.nonStriker.mentality = document.getElementById("opener-2-mentality").value;

            this.logCommentary("Innings 2", `Innings 2 starts. Target is ${state2.target}. Openers: ${state2.striker.name} with ${state2.striker.mentality.toUpperCase()} & ${state2.nonStriker.name} with ${state2.nonStriker.mentality.toUpperCase()} mentality.`, "welcome");
            this.updateUI();
            this.drawField();
            this.triggerBowlerSelection();
        };
    }

    setupNextTestInnings() {
        const state = this.getCurrentState();
        const nextIdx = this.currentInningsIndex + 1;
        
        // Define team names based on order
        const batName = this.userBatsFirst ? (nextIdx % 2 === 0 ? "IND 2nd" : "AUS 2nd") : (nextIdx % 2 === 0 ? "AUS 2nd" : "IND 2nd");
        const isUserBatting = this.userBatsFirst ? (nextIdx % 2 === 0) : (nextIdx % 2 !== 0);

        // Reset rosters before each innings
        const nextBattingTeam = isUserBatting ? OUR_TEAM_ROSTER : OPPONENT_TEAM_ROSTER;
        const nextBowlingTeam = isUserBatting ? OPPONENT_TEAM_ROSTER : OUR_TEAM_ROSTER;
        
        nextBattingTeam.forEach(p => p.resetStats());
        
        let target = null;
        if (nextIdx === 3) {
            // Innings 4 target is (Team A Innings 1 + Innings 2) - (Team B Innings 1)
            const combinedA = this.inningsList[0].totalRuns + this.inningsList[2].totalRuns;
            const scoreB1 = this.inningsList[1].totalRuns;
            target = combinedA - scoreB1 + 1;
            this.logCommentary("Target Details", `Target for ${batName} to chase: ${target} runs.`, "welcome");
        }

        const nextInnings = new InningsState(nextBattingTeam, nextBowlingTeam, batName, isUserBatting, target);
        this.inningsList.push(nextInnings);
        this.currentInningsIndex = nextIdx;

        // Auto select openers
        const sortedAI = [...nextInnings.battingTeam].sort((a,b) => b.batting - a.batting);
        nextInnings.striker = sortedAI[0];
        nextInnings.nonStriker = sortedAI[1];
        nextInnings.striker.hasBatted = true;
        nextInnings.nonStriker.hasBatted = true;

        this.logCommentary("Test Innings Change", `Innings ${nextIdx + 1} begins. ${nextInnings.teamName} starts batting. Openers: ${nextInnings.striker.name} & ${nextInnings.nonStriker.name}.`, "welcome");
        this.updateUI();
        this.drawField();
        this.triggerBowlerSelection();
    }

    showSummaryScreen() {
        this.matchScreen.classList.add("hidden");
        this.summaryScreen.classList.remove("hidden");

        const i1 = this.inningsList[0];
        const i2 = this.inningsList[1];
        let winnerText = "";

        if (this.format === "T20") {
            if (i2.totalRuns >= i2.target) {
                winnerText = `${i2.teamName.split(" ")[0]} wins by ${10 - i2.wickets} wickets!`;
            } else if (i2.totalRuns < i2.target - 1) {
                winnerText = `${i1.teamName.split(" ")[0]} wins by ${i1.totalRuns - i2.totalRuns} runs!`;
            } else {
                winnerText = "It's a TIE match!";
            }
        } else {
            // Test result calculation
            const i3 = this.inningsList[2];
            const i4 = this.inningsList[3];

            const totalTeamA = i1.totalRuns + i3.totalRuns;
            const totalTeamB = i2.totalRuns + i4.totalRuns;
            
            const teamAName = i1.teamName.split(" ")[0];
            const teamBName = i2.teamName.split(" ")[0];

            if (i4.totalRuns >= i4.target) {
                winnerText = `${teamBName} wins by ${10 - i4.wickets} wickets!`;
            } else if (i4.isCompleted && totalTeamB < totalTeamA) {
                winnerText = `${teamAName} wins by ${totalTeamA - totalTeamB} runs!`;
            } else {
                winnerText = "The match ended in a Draw!";
            }
        }

        this.matchWinnerText.textContent = winnerText;
        this.renderSummaryScorecard(0);

        this.summaryTabInnings1.onclick = () => {
            this.summaryTabInnings1.classList.add("active");
            this.summaryTabInnings2.classList.remove("active");
            this.renderSummaryScorecard(0);
        };

        this.summaryTabInnings2.onclick = () => {
            this.summaryTabInnings2.classList.add("active");
            this.summaryTabInnings1.classList.remove("active");
            this.renderSummaryScorecard(1);
        };
    }

    renderSummaryScorecard(inningsIdx) {
        this.summaryScorecardsContainer.innerHTML = "";
        const state = this.inningsList[inningsIdx];
        if (!state) return;

        // Build HTML Tables for batting & bowling
        let batHTML = `
            <table class="card-table">
                <thead>
                    <tr>
                        <th>Batter</th>
                        <th class="text-right">Runs</th>
                        <th class="text-right">Balls</th>
                        <th class="text-right">4s</th>
                        <th class="text-right">6s</th>
                        <th class="text-right">SR</th>
                    </tr>
                </thead>
                <tbody>
        `;

        state.battingTeam.forEach(p => {
            if (p.hasBatted) {
                const status = p.isOut ? "Out" : "Not Out";
                batHTML += `
                    <tr>
                        <td><strong>${p.name}</strong> <span style="font-size:0.75rem; color:var(--text-secondary)">(${status})</span></td>
                        <td class="text-right">${p.runsScored}</td>
                        <td class="text-right">${p.ballsFaced}</td>
                        <td class="text-right">${p.fours}</td>
                        <td class="text-right">${p.sixes}</td>
                        <td class="text-right">${p.getStrikeRate()}</td>
                    </tr>
                `;
            }
        });

        batHTML += `</tbody></table>`;

        let bowlHTML = `
            <table class="card-table" style="margin-top:20px;">
                <thead>
                    <tr>
                        <th>Bowler</th>
                        <th class="text-right">Overs</th>
                        <th class="text-right">Maidens</th>
                        <th class="text-right">Runs</th>
                        <th class="text-right">Wickets</th>
                        <th class="text-right">Econ</th>
                    </tr>
                </thead>
                <tbody>
        `;

        state.bowlingTeam.forEach(p => {
            if (p.ballsBowled > 0) {
                bowlHTML += `
                    <tr>
                        <td><strong>${p.name}</strong></td>
                        <td class="text-right">${p.getOversString()}</td>
                        <td class="text-right">${p.maidens}</td>
                        <td class="text-right">${p.runsConceded}</td>
                        <td class="text-right">${p.wickets}</td>
                        <td class="text-right">${p.getEconomyRate()}</td>
                    </tr>
                `;
            }
        });

        bowlHTML += `</tbody></table>`;

        this.summaryScorecardsContainer.innerHTML = `<h3>${state.teamName} Scorecard</h3>` + batHTML + bowlHTML;
    }

    resetToSetup() {
        this.summaryScreen.classList.add("hidden");
        this.setupScreen.classList.remove("hidden");
        
        this.tossHeadsBtn.disabled = false;
        this.tossTailsBtn.disabled = false;
        this.matchFormatSelect.disabled = false;
        this.pitchTypeSelect.disabled = false;

        this.tossResultText.textContent = "";
        this.tossDecisionContainer.classList.add("hidden");
        this.coin.className = "coin";

        this.commentaryFeed.innerHTML = `
            <div class="commentary-ball-item welcome">
                <span class="tag">System</span> Welcome to Cricket Sim Pro! Press "Bowl Ball" to start.
            </div>
        `;
    }

    // =========================================================
    // UI REFRESH
    // =========================================================

    updateUI() {
        const state = this.getCurrentState();
        if (!state) return;

        // CRICKBUZZ HEADER
        this.battingTeamNameUI.textContent = state.teamName;
        this.battingRunsWicketsUI.textContent = `${state.totalRuns}/${state.wickets}`;
        
        const overs = Math.floor(state.ballsBowled / 6);
        const balls = state.ballsBowled % 6;
        this.battingOversUI.textContent = `(${overs}.${balls} Overs)`;

        this.matchStatusLabel.textContent = `${state.teamName.includes("1st") ? "1st Innings" : "2nd Innings"}`;

        if (state.target) {
            const needed = state.target - state.totalRuns;
            const totalBalls = this.format === "T20" ? 120 : 2700; // max balls limit
            const left = Math.max(0, totalBalls - state.ballsBowled);
            this.chaseDetailsUI.textContent = `${needed} runs needed in ${left} balls.`;
        } else {
            this.chaseDetailsUI.textContent = "1st Innings progress card";
        }

        // Recent balls list
        this.recentBallsUI.innerHTML = "";
        state.recentBalls.forEach(ev => {
            if (ev === "|") {
                const div = document.createElement("div");
                div.className = "recent-divider";
                this.recentBallsUI.appendChild(div);
            } else {
                const span = document.createElement("span");
                span.className = "ball-bubble";
                if (ev === "4") span.classList.add("four");
                else if (ev === "6") span.classList.add("six");
                else if (ev === "W") span.classList.add("wicket");
                else if (ev === "Wd" || ev === "Nb") span.classList.add("extra");
                
                span.textContent = ev;
                this.recentBallsUI.appendChild(span);
            }
        });

        // HEADER BATTERS DISPLAY (Top Bar)
        if (state.striker && state.nonStriker) {
            this.headerBattersUI.innerHTML = `
                <span style="font-weight: bold; color: var(--color-primary); border-bottom: 2px solid var(--color-primary); padding-bottom: 2px;">
                    ${state.striker.name} ${state.striker.runsScored}*(${state.striker.ballsFaced})
                </span>
                <span style="color: var(--text-secondary); margin: 0 4px;">|</span>
                <span style="color: var(--text-primary);">
                    ${state.nonStriker.name} ${state.nonStriker.runsScored}(${state.nonStriker.ballsFaced})
                </span>
            `;
        } else {
            this.headerBattersUI.innerHTML = "";
        }

        // BATTING LIVE CARDS & MENTALITY CONTROLS (RIGHT SIDE)
        if (!state.isUserBatting) {
            // Opponent is batting: Hide opponent stats and control options
            this.coachBattingControls.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.85rem; border: 1px dashed var(--border-color); border-radius: 8px; background: rgba(0,0,0,0.15); width: 100%;">
                    <i class="fa-solid fa-shield-halved" style="font-size: 1.5rem; margin-bottom: 8px; display: block; color: var(--border-color); opacity: 0.7;"></i>
                    Opponent team is batting.<br>Manage your bowling rotations.
                </div>
            `;
        } else {
            // User team is batting: Show both batters and their mentality controls respectively
            this.coachBattingControls.innerHTML = "";

            // 1. Striker
            if (state.striker) {
                const card = document.createElement("div");
                card.className = "coach-batsman-card";
                card.style.cssText = "padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(0,0,0,0.15); border-left: 4px solid var(--color-primary); width: 100%; box-sizing: border-box;";
                
                const isLocked = state.striker.ballsFaced < 50;
                const lockText = isLocked ? `(Locked: ${state.striker.ballsFaced}/50 balls)` : `(Unlocked!)`;
                
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong>${state.striker.name}* <span style="font-size: 0.72rem; font-weight: normal; color: var(--color-primary);">(Striker)</span></strong>
                        <span style="font-weight: bold; color: var(--color-primary); font-size: 0.9rem;">${state.striker.runsScored}*(${state.striker.ballsFaced})</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 5px; flex-wrap: wrap;">
                        <span class="lock-label" style="font-size: 0.7rem; color: ${isLocked ? "var(--color-gold)" : "var(--color-success)"}; margin: 0; opacity: 0.85;">${lockText}</span>
                        <div class="mentality-toggle-mini" style="display: flex; gap: 3px;">
                            <button class="mentality-btn btn-mini ${state.striker.mentality === "defensive" ? "active" : ""}" data-mentality="defensive" ${isLocked ? "disabled" : ""}>Def</button>
                            <button class="mentality-btn btn-mini ${state.striker.mentality === "normal" ? "active" : ""}" data-mentality="normal" ${isLocked ? "disabled" : ""}>Bal</button>
                            <button class="mentality-btn btn-mini ${state.striker.mentality === "attack" ? "active" : ""}" data-mentality="attack" ${isLocked ? "disabled" : ""}>Att</button>
                        </div>
                    </div>
                `;

                card.querySelectorAll(".mentality-btn").forEach(btn => {
                    btn.onclick = (e) => {
                        state.striker.mentality = e.currentTarget.dataset.mentality;
                        this.updateUI();
                    };
                });

                this.coachBattingControls.appendChild(card);
            }

            // 2. Non-Striker
            if (state.nonStriker) {
                const card = document.createElement("div");
                card.className = "coach-batsman-card";
                card.style.cssText = "padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; background: rgba(0,0,0,0.15); width: 100%; box-sizing: border-box;";
                
                const isLocked = state.nonStriker.ballsFaced < 50;
                const lockText = isLocked ? `(Locked: ${state.nonStriker.ballsFaced}/50 balls)` : `(Unlocked!)`;
                
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong>${state.nonStriker.name}</strong>
                        <span style="font-weight: bold; font-size: 0.9rem;">${state.nonStriker.runsScored}(${state.nonStriker.ballsFaced})</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 5px; flex-wrap: wrap;">
                        <span class="lock-label" style="font-size: 0.7rem; color: ${isLocked ? "var(--color-gold)" : "var(--color-success)"}; margin: 0; opacity: 0.85;">${lockText}</span>
                        <div class="mentality-toggle-mini" style="display: flex; gap: 3px;">
                            <button class="mentality-btn btn-mini ${state.nonStriker.mentality === "defensive" ? "active" : ""}" data-mentality="defensive" ${isLocked ? "disabled" : ""}>Def</button>
                            <button class="mentality-btn btn-mini ${state.nonStriker.mentality === "normal" ? "active" : ""}" data-mentality="normal" ${isLocked ? "disabled" : ""}>Bal</button>
                            <button class="mentality-btn btn-mini ${state.nonStriker.mentality === "attack" ? "active" : ""}" data-mentality="attack" ${isLocked ? "disabled" : ""}>Att</button>
                        </div>
                    </div>
                `;

                card.querySelectorAll(".mentality-btn").forEach(btn => {
                    btn.onclick = (e) => {
                        state.nonStriker.mentality = e.currentTarget.dataset.mentality;
                        this.updateUI();
                    };
                });

                this.coachBattingControls.appendChild(card);
            }
        }

        // BOWLER LIVE CARD (RIGHT SIDE)
        if (state.currentBowler) {
            this.uiBowlerName.textContent = state.currentBowler.name;
            this.uiBowlerStats.textContent = `${state.currentBowler.getOversString()} - ${state.currentBowler.maidens} - ${state.currentBowler.runsConceded} - ${state.currentBowler.wickets}`;
            
            const limit = this.format === "T20" ? "4 max" : "unlimited";
            this.bowlerOversLeftUI.textContent = `Bowler over: ${state.currentBowler.getOversString()} (${limit})`;
        } else {
            this.uiBowlerName.textContent = "Selecting Bowler...";
            this.uiBowlerStats.textContent = "0.0 - 0 - 0 - 0";
            this.bowlerOversLeftUI.textContent = "Pending spell selection";
        }

        // DETAILED SCORECARD TABLES (LEFT SIDE)
        // 1. Batting table
        this.battingScorecardTbody.innerHTML = "";
        state.battingTeam.forEach(p => {
            if (p.hasBatted) {
                const tr = document.createElement("tr");
                const isStriking = p === state.striker;
                const isNonStriking = p === state.nonStriker;
                
                if (isStriking || isNonStriking) {
                    tr.classList.add("active-batter-row");
                }

                const label = isStriking ? `${p.name}*` : p.name;
                const outStatus = p.isOut ? "out" : "not out";
                
                tr.innerHTML = `
                    <td><strong>${label}</strong></td>
                    <td><span style="font-size:0.75rem; color:var(--text-secondary)">${outStatus}</span></td>
                    <td class="text-right">${p.runsScored}</td>
                    <td class="text-right">${p.ballsFaced}</td>
                    <td class="text-right">${p.fours}</td>
                    <td class="text-right">${p.sixes}</td>
                    <td class="text-right">${p.getStrikeRate()}</td>
                `;
                this.battingScorecardTbody.appendChild(tr);
            }
        });

        // 2. Bowling table
        this.bowlingScorecardTbody.innerHTML = "";
        state.bowlingTeam.forEach(p => {
            if (p.ballsBowled > 0 || p === state.currentBowler) {
                const tr = document.createElement("tr");
                if (p === state.currentBowler) {
                    tr.classList.add("active-bowler-row");
                }

                tr.innerHTML = `
                    <td><strong>${p.name}</strong></td>
                    <td class="text-right">${p.getOversString()}</td>
                    <td class="text-right">${p.maidens}</td>
                    <td class="text-right">${p.runsConceded}</td>
                    <td class="text-right">${p.wickets}</td>
                    <td class="text-right">${p.getEconomyRate()}</td>
                `;
                this.bowlingScorecardTbody.appendChild(tr);
            }
        });

        // Phase Badge
        const totalOvers = Math.floor(state.ballsBowled / 6) + 1;
        if (this.format === "T20") {
            if (totalOvers <= 6) this.matchPhaseBadge.textContent = "Powerplay (Overs 1-6)";
            else if (totalOvers >= 16) this.matchPhaseBadge.textContent = "Death Overs (16-20)";
            else this.matchPhaseBadge.textContent = "Middle Overs (7-15)";
        } else {
            this.matchPhaseBadge.textContent = `Pitch: ${this.pitch} | Session: Test`;
        }

        // Render over commentary
        this.updateCommentarySelect();
        this.renderCommentary();

        // Validate fielding rules (deep limits vary based on PP overs 1-6)
        this.validateFieldingRules();

        if (this.fieldingPresetSelect) {
            this.fieldingPresetSelect.value = state.fieldingPreset;
        }
    }

    disableActions(disabled) {
        if (this.isSimulatingMatch) {
            this.simPlayBtn.disabled = false;
            this.simBallBtn.disabled = true;
            this.simOverBtn.disabled = true;
            this.simBallBtn.style.opacity = 0.5;
            this.simOverBtn.style.opacity = 0.5;
            return;
        }

        this.simPlayBtn.disabled = disabled;
        this.simBallBtn.disabled = disabled;
        this.simOverBtn.disabled = disabled;
        
        if (disabled) {
            this.simPlayBtn.style.opacity = 0.5;
            this.simBallBtn.style.opacity = 0.5;
            this.simOverBtn.style.opacity = 0.5;
        } else {
            this.simPlayBtn.style.opacity = 1;
            this.simBallBtn.style.opacity = 1;
            this.simOverBtn.style.opacity = 1;
        }
    }

    simulateOverCall() {
        if (this.isAnimating) return;
        const state = this.getCurrentState();
        if (!state || state.isCompleted) return;

        // Auto simulate the remaining balls of the over
        const ballsLeft = 6 - state.ballsThisOver;
        this.simulateBallsCount(ballsLeft);
    }

    simulateBallsCount(count) {
        if (count <= 0) return;
        const state = this.getCurrentState();
        if (!state || state.isCompleted || state.ballsThisOver >= 6) return;

        // Silent simulator (no visual path delays) to finish over quickly
        this.isAnimating = true;
        this.disableActions(true);

        const overNum = Math.floor(state.ballsBowled / 6) + 1;
        const probs = this.getProbabilities(overNum, state.striker, state.currentBowler, state.freeHit);
        const result = this.chooseOutcome(probs);

        // Instantly process ball outcomes
        this.processBallOutcome(result);

        setTimeout(() => {
            // recursive play next ball if not finished
            const targetChased = state.target && state.totalRuns >= state.target;
            const allOut = state.wickets >= 10;
            
            if (!targetChased && !allOut && state.ballsThisOver > 0 && count > 1) {
                this.simulateBallsCount(count - 1);
            } else {
                this.isAnimating = false;
                this.disableActions(false);
            }
        }, 300);
    }

    toggleMatchSimulation() {
        if (this.isSimulatingMatch) {
            this.pauseMatchSimulation("Paused by user");
        } else {
            this.startMatchSimulation();
        }
    }

    startMatchSimulation() {
        const state = this.getCurrentState();
        if (!state || state.isCompleted) return;

        this.isSimulatingMatch = true;
        this.simPlayBtn.classList.add("active");
        this.simPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Simulation';

        this.disableActions(true);
        this.simulateBallCall();
    }

    pauseMatchSimulation(reason = "") {
        this.isSimulatingMatch = false;
        this.simPlayBtn.classList.remove("active");
        this.simPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i> Start Simulation';

        if (this.autoplayTimer) {
            clearTimeout(this.autoplayTimer);
            this.autoplayTimer = null;
        }

        this.disableActions(false);
    }

    logCommentary(over, text, outcome) {
        const state = this.getCurrentState();
        if (!state) return;

        let overIndex = 1;
        const parts = over.split('.');
        if (parts.length === 2 && !isNaN(parts[0])) {
            overIndex = parseInt(parts[0]) + 1;
        } else {
            overIndex = Math.floor((state.ballsBowled - 1) / 6) + 1;
            if (overIndex < 1) overIndex = 1;
        }

        if (!state.overCommentary[overIndex]) {
            state.overCommentary[overIndex] = [];
        }

        state.overCommentary[overIndex].push({ over, text, outcome });

        // Update commentary select dropdown options
        this.updateCommentarySelect();

        // Refresh the commentary panel
        this.renderCommentary();
    }

    updateCommentarySelect() {
        const state = this.getCurrentState();
        if (!state) return;

        const select = document.getElementById("commentary-over-select");
        if (!select) return;

        const currentSelected = select.value;

        // Reset to default
        select.innerHTML = '<option value="current">Current Over</option>';

        // Get sorted over numbers
        const overs = Object.keys(state.overCommentary).map(Number).sort((a, b) => a - b);
        
        overs.forEach(o => {
            const opt = new Option(`Over ${o}`, o);
            select.add(opt);
        });

        // Restore selection
        if (currentSelected && [...select.options].some(opt => opt.value === currentSelected)) {
            select.value = currentSelected;
        } else {
            select.value = "current";
        }
    }

    renderCommentary() {
        const state = this.getCurrentState();
        if (!state) return;

        const feed = this.commentaryFeed;
        if (!feed) return;

        feed.innerHTML = "";

        const select = document.getElementById("commentary-over-select");
        let selectedOver = select ? select.value : "current";

        let overIndexToShow = 1;
        if (selectedOver === "current") {
            overIndexToShow = Math.floor(state.ballsBowled / 6) + 1;
            if (state.isCompleted && !state.overCommentary[overIndexToShow]) {
                const overs = Object.keys(state.overCommentary).map(Number).sort((a,b) => b - a);
                if (overs.length > 0) {
                    overIndexToShow = overs[0];
                }
            }
        } else {
            overIndexToShow = parseInt(selectedOver);
        }

        const items = state.overCommentary[overIndexToShow] || [];

        // Render from newest to oldest
        for (let i = items.length - 1; i >= 0; i--) {
            const logItem = items[i];
            const item = document.createElement("div");
            item.className = "commentary-ball-item";

            let tagHTML = "";
            if (logItem.outcome === "welcome" || logItem.outcome === "over-conclusion-item") {
                item.classList.add(logItem.outcome);
                tagHTML = `<span class="tag">${logItem.over}</span>`;
            } else {
                let badgeClass = "runs";
                if (logItem.outcome === "W") badgeClass = "out";
                else if (logItem.outcome === "4") badgeClass = "boundary-4";
                else if (logItem.outcome === "6") badgeClass = "boundary-6";
                else if (logItem.outcome === "•") badgeClass = "dot";
                else if (logItem.outcome === "Wd" || logItem.outcome === "Nb") badgeClass = "extra";

                tagHTML = `
                    <span class="ball-num-badge">${logItem.over}</span>
                    <span class="outcome-tag ${badgeClass}">${logItem.outcome}</span>
                `;
            }

            item.innerHTML = `
                ${tagHTML}
                <div class="commentary-text">${logItem.text}</div>
            `;
            feed.appendChild(item);
        }

        // If no commentary items
        if (items.length === 0) {
            feed.innerHTML = `<div class="commentary-ball-item welcome"><span class="tag">Match</span> No commentary for Over ${overIndexToShow}.</div>`;
        }
    }

    applyFieldingPreset(presetName) {
        const state = this.getCurrentState();
        if (!state) return;

        state.fieldingPreset = presetName;

        const presets = {
            balanced: [
                { name: "Slip", x: 325, y: 225 },
                { name: "Point", x: 420, y: 250 },
                { name: "Cover", x: 390, y: 325 },
                { name: "Mid Off", x: 340, y: 405 },
                { name: "Mid On", x: 260, y: 405 },
                { name: "Mid Wicket", x: 210, y: 325 },
                { name: "Square Leg", x: 180, y: 250 },
                { name: "Fine Leg", x: 245, y: 205 },
                { name: "Third Man", x: 420, y: 160 }
            ],
            attacking: [
                { name: "Slip", x: 320, y: 225 },
                { name: "Point", x: 340, y: 245 },
                { name: "Cover", x: 350, y: 290 },
                { name: "Mid Off", x: 330, y: 345 },
                { name: "Mid On", x: 270, y: 345 },
                { name: "Mid Wicket", x: 250, y: 290 },
                { name: "Square Leg", x: 260, y: 245 },
                { name: "Fine Leg", x: 290, y: 220 },
                { name: "Third Man", x: 335, y: 215 }
            ],
            defensive: [
                { name: "Slip", x: 345, y: 175 },
                { name: "Point", x: 480, y: 250 },
                { name: "Cover", x: 450, y: 350 },
                { name: "Mid Off", x: 350, y: 470 },
                { name: "Mid On", x: 250, y: 470 },
                { name: "Mid Wicket", x: 150, y: 350 },
                { name: "Square Leg", x: 120, y: 250 },
                { name: "Fine Leg", x: 180, y: 180 },
                { name: "Third Man", x: 450, y: 160 }
            ]
        };

        if (presets[presetName]) {
            const keeper = state.fielderPositions.find(p => p.name === "Keeper");
            const bowler = state.fielderPositions.find(p => p.name === "Bowler");
            
            state.fielderPositions = [
                keeper,
                bowler,
                ...presets[presetName].map(f => ({ ...f }))
            ];
        }

        this.validateFieldingRules();
        this.drawField();
    }

    setupFieldDragHandler() {
        let selectedFielder = null;
        let fielderIndex = -1;
        
        const getSVGCoords = (e) => {
            const rect = this.cricketField.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const x = (clientX - rect.left) / rect.width * 600;
            const y = (clientY - rect.top) / rect.height * 600;
            return { x, y };
        };

        this.cricketField.addEventListener("mousedown", (e) => {
            const targetG = e.target.closest(".draggable-fielder");
            if (!targetG) return;

            const state = this.getCurrentState();
            if (!state) return;

            const idx = parseInt(targetG.dataset.idx);
            const fielder = state.fielderPositions[idx];
            
            if (fielder && !fielder.isFixed) {
                selectedFielder = fielder;
                fielderIndex = idx;
                targetG.classList.add("dragging-active");
                e.preventDefault();
            }
        });

        this.cricketField.addEventListener("mousemove", (e) => {
            if (!selectedFielder) return;
            const coords = getSVGCoords(e);
            
            const dx = coords.x - 300;
            const dy = coords.y - 300;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 278) {
                selectedFielder.x = Math.round(coords.x);
                selectedFielder.y = Math.round(coords.y);
            } else {
                const angle = Math.atan2(dy, dx);
                selectedFielder.x = Math.round(300 + Math.cos(angle) * 277);
                selectedFielder.y = Math.round(300 + Math.sin(angle) * 277);
            }

            if (this.fieldingPresetSelect) {
                this.fieldingPresetSelect.value = "custom";
            }
            const state = this.getCurrentState();
            if (state) state.fieldingPreset = "custom";

            this.validateFieldingRules();
            this.drawField();
        });

        const stopDrag = () => {
            if (selectedFielder) {
                const g = this.cricketField.querySelector(`.draggable-fielder[data-idx="${fielderIndex}"]`);
                if (g) g.classList.remove("dragging-active");
                selectedFielder = null;
                fielderIndex = -1;
            }
        };

        this.cricketField.addEventListener("mouseup", stopDrag);
        this.cricketField.addEventListener("mouseleave", stopDrag);

        this.cricketField.addEventListener("touchstart", (e) => {
            const targetG = e.target.closest(".draggable-fielder");
            if (!targetG) return;

            const state = this.getCurrentState();
            if (!state) return;

            const idx = parseInt(targetG.dataset.idx);
            const fielder = state.fielderPositions[idx];
            
            if (fielder && !fielder.isFixed) {
                selectedFielder = fielder;
                fielderIndex = idx;
                targetG.classList.add("dragging-active");
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });

        this.cricketField.addEventListener("touchmove", (e) => {
            if (!selectedFielder) return;
            const coords = getSVGCoords(e);
            
            const dx = coords.x - 300;
            const dy = coords.y - 300;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 278) {
                selectedFielder.x = Math.round(coords.x);
                selectedFielder.y = Math.round(coords.y);
            } else {
                const angle = Math.atan2(dy, dx);
                selectedFielder.x = Math.round(300 + Math.cos(angle) * 277);
                selectedFielder.y = Math.round(300 + Math.sin(angle) * 277);
            }

            if (this.fieldingPresetSelect) {
                this.fieldingPresetSelect.value = "custom";
            }
            const state = this.getCurrentState();
            if (state) state.fieldingPreset = "custom";

            this.validateFieldingRules();
            this.drawField();
        }, { passive: false });

        this.cricketField.addEventListener("touchend", stopDrag);
    }

    validateFieldingRules() {
        const state = this.getCurrentState();
        if (!state) return true;

        const overNum = Math.floor(state.ballsBowled / 6) + 1;
        const isPowerplay = this.format === "T20" && overNum <= 6;

        let deepCount = 0;
        let legSideCount = 0;
        let behindSquareLegCount = 0;

        state.fielderPositions.forEach(f => {
            const dxCenter = f.x - 300;
            const dyCenter = f.y - 300;
            const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);
            if (distCenter > 160) {
                deepCount++;
            }

            if (f.x > 300 && f.name !== "Bowler" && f.name !== "Keeper") {
                legSideCount++;
                
                if (f.y < 240) {
                    behindSquareLegCount++;
                }
            }
        });

        let isValid = true;
        let errorMsg = "Field Valid";

        const deepLimit = isPowerplay ? 2 : 5;
        if (deepCount > deepLimit) {
            isValid = false;
            errorMsg = `Deep fielders limit exceeded (${deepCount}/${deepLimit})`;
        } else if (legSideCount > 5) {
            isValid = false;
            errorMsg = `Too many leg side fielders (${legSideCount}/5)`;
        } else if (behindSquareLegCount > 2) {
            isValid = false;
            errorMsg = `Too many behind square leg (${behindSquareLegCount}/2)`;
        }

        if (this.fieldingValidationBadge) {
            this.fieldingValidationBadge.textContent = errorMsg;
            if (isValid) {
                this.fieldingValidationBadge.className = "badge bg-success";
            } else {
                this.fieldingValidationBadge.className = "badge bg-danger";
            }
        }

        const disableSim = !isValid;
        this.simBallBtn.disabled = disableSim;
        this.simOverBtn.disabled = disableSim;
        this.simPlayBtn.disabled = disableSim;
        
        this.simBallBtn.style.opacity = disableSim ? 0.5 : 1;
        this.simOverBtn.style.opacity = disableSim ? 0.5 : 1;
        this.simPlayBtn.style.opacity = disableSim ? 0.5 : 1;

        return isValid;
    }

    renderSectorGaps(state) {
        if (!this.svgSectorLines || !this.svgGapLabels) return;
        this.svgSectorLines.innerHTML = "";
        this.svgGapLabels.innerHTML = "";

        const activeFielders = state.fielderPositions.filter(f => !f.isFixed);
        if (activeFielders.length < 2) return;

        const fieldersWithAngles = activeFielders.map((f, idx) => {
            const dx = f.x - 300;
            const dy = f.y - 240;
            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            if (angle < 0) angle += 360;
            return { ...f, angle };
        });

        fieldersWithAngles.sort((a, b) => a.angle - b.angle);

        for (let i = 0; i < fieldersWithAngles.length; i++) {
            const f1 = fieldersWithAngles[i];
            const f2 = fieldersWithAngles[(i + 1) % fieldersWithAngles.length];

            const rad = f1.angle * Math.PI / 180;
            const targetX = 300 + Math.cos(rad) * 278;
            const targetY = 240 + Math.sin(rad) * 278;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", "300");
            line.setAttribute("y1", "240");
            line.setAttribute("x2", targetX.toString());
            line.setAttribute("y2", targetY.toString());
            line.setAttribute("class", "sector-line");
            this.svgSectorLines.appendChild(line);

            let gap = f2.angle - f1.angle;
            if (gap < 0) gap += 360;

            let midAngle = f1.angle + gap / 2;
            if (midAngle >= 360) midAngle -= 360;

            const midRad = midAngle * Math.PI / 180;
            const labelX = 300 + Math.cos(midRad) * 135;
            const labelY = 240 + Math.sin(midRad) * 135;

            const f1DistCenter = Math.sqrt((f1.x - 300)**2 + (f1.y - 300)**2);
            const f2DistCenter = Math.sqrt((f2.x - 300)**2 + (f2.y - 300)**2);
            const isDeepCovered = f1DistCenter > 160 || f2DistCenter > 160;

            let statusClass = "closed";
            if (gap >= 35) {
                statusClass = "open";
            } else if (gap >= 25) {
                statusClass = "partial";
            }

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", labelX.toString());
            text.setAttribute("y", labelY.toString());
            text.setAttribute("class", `gap-label ${statusClass}`);
            text.textContent = `${Math.round(gap)}°${isDeepCovered ? '(D)' : ''}`;
            this.svgGapLabels.appendChild(text);
        }
    }
}

// Initialise App on Load
window.addEventListener("DOMContentLoaded", () => {
    window.game = new MatchManager();
});
