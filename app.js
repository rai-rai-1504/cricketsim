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
            { name: "Slip", x: 275, y: 225 },
            { name: "Point", x: 180, y: 250 },
            { name: "Cover", x: 210, y: 325 },
            { name: "Mid Off", x: 260, y: 405 },
            { name: "Mid On", x: 340, y: 405 },
            { name: "Mid Wicket", x: 390, y: 325 },
            { name: "Square Leg", x: 420, y: 250 },
            { name: "Fine Leg", x: 355, y: 205 },
            { name: "Third Man", x: 180, y: 160 }
        ];
        this.fieldingPreset = "balanced";
        this.reviewsLeft = 2;
        this.opponentReviewsLeft = 2;
        
        this.ballHistory = []; // Tracks last 9 deliveries with sector and runs
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

        // DRS Controls
        this.appealModal = document.getElementById("appeal-modal");
        this.drsModal = document.getElementById("drs-modal");
        this.btnDrsReview = document.getElementById("btn-drs-review");
        this.btnDrsAccept = document.getElementById("btn-drs-accept");
        this.btnDrsClose = document.getElementById("btn-drs-close");

        // 3D View Controls
        this.btnToggleView3D = document.getElementById("btn-toggle-view-3d");
        this.threeCanvasContainer = document.getElementById("three-canvas-container");
        this.btnFullscreen3D = document.getElementById("btn-fullscreen-3d");
        this.is3DViewActive = false;

        // 3D HUD & Selection overlays
        this.threeHUDScoreboard = document.getElementById("three-hud-scoreboard");
        this.threeHUDScoreVal = document.getElementById("three-hud-score-val");
        this.threeHUDOversVal = document.getElementById("three-hud-overs-val");
        this.threeHUDBatTeam = document.getElementById("three-hud-bat-team");
        this.threeHUDBatsmen = document.getElementById("three-hud-batsmen");
        this.threeHUDBowler = document.getElementById("three-hud-bowler");
        this.threeSelectionOverlay = document.getElementById("three-selection-overlay");
        this.threeSelectTitle = document.getElementById("three-select-title");
        this.threeSelectDropdown = document.getElementById("three-select-dropdown");
        this.threeSelectMentality = document.getElementById("three-select-mentality");
        this.threeSelectExtraOptions = document.getElementById("three-select-extra-options");
        this.btnThreeSelectSubmit = document.getElementById("btn-three-select-submit");

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

        this.startMatchBtn.addEventListener("click", () => this.handleStartMatchBtnClick());

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

        // DRS Review Listeners
        this.btnDrsReview.addEventListener("click", () => this.executeUserReview());
        this.btnDrsAccept.addEventListener("click", () => this.executeUserAccept());
        this.btnDrsClose.addEventListener("click", () => this.closeDrsVisualizer());

        // 3D View Toggle Listener
        if (this.btnToggleView3D) {
            this.btnToggleView3D.addEventListener("click", () => this.toggle3DView());
        }

        if (this.btnFullscreen3D) {
            this.btnFullscreen3D.addEventListener("click", () => this.toggle3DFullscreen());
        }
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
        if (state.isUserBatting) {
            const op1Idx = parseInt(this.opener1Select.value);
            const op2Idx = parseInt(this.opener2Select.value);
            state.striker = state.battingTeam[op1Idx];
            state.nonStriker = state.battingTeam[op2Idx];
            state.striker.hasBatted = true;
            state.nonStriker.hasBatted = true;
            state.striker.mentality = document.getElementById("opener-1-mentality").value;
            state.nonStriker.mentality = document.getElementById("opener-2-mentality").value;
        } else {
            // Opponent batting first: select top 2 by batting rating
            const sortedAI = [...state.battingTeam].sort((a,b) => b.batting - a.batting);
            state.striker = sortedAI[0];
            state.nonStriker = sortedAI[1];
            state.striker.hasBatted = true;
            state.nonStriker.hasBatted = true;
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

        if (this.is3DViewActive) {
            this.draw3DField();
        }

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

                    // 1. Boundary Protection (Deep Coverage)
                    if (isDeep) {
                        // Defensive sector: Saves boundaries, gives away singles
                        probs["4"] = Math.max(1, probs["4"] - 4);
                        probs["6"] = Math.max(0, probs["6"] - 2);
                        probs["1"] += 6;
                        probs["2"] += 2;
                        probs["DOT"] = Math.max(5, probs["DOT"] - 2);
                    } else {
                        // Attacking sector: Higher boundary risk, restricts singles
                        probs["4"] += 4;
                        probs["6"] += 2;
                        probs["1"] = Math.max(2, probs["1"] - 4);
                        probs["2"] = Math.max(0, probs["2"] - 2);
                    }

                    // 2. Infield Catching Pressure (Gap Size)
                    if (gap < 28) {
                        // Closed gap: high pressure, dots and catches
                        probs["DOT"] += 6;
                        probs["W"] += 1.5;
                        probs["4"] = Math.max(1, probs["4"] - 2);
                    } else if (gap >= 45) {
                        // Wide gap: easy pierce, low pressure
                        probs["DOT"] = Math.max(5, probs["DOT"] - 4);
                        probs["W"] = Math.max(0.5, probs["W"] - 1.5);
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

        // Pre-select commentary text so the 3D animation knows what the batsman is doing
        this.preSelectedCommentaryMsg = "";
        this.preSelectedWicketType = ""; // "BOWLED", "LBW", "CATCH"

        if (result === "DOT") {
            this.preSelectedCommentaryMsg = commentaryLines.DOT[Math.floor(Math.random() * commentaryLines.DOT.length)];
        } else if (result === "W") {
            const wtype = Math.random() < 0.35 ? "BOWLED" : (Math.random() < 0.65 ? "LBW" : "CATCH");
            this.preSelectedWicketType = wtype;
            
            let desc = "";
            if (wtype === "BOWLED") {
                desc = "Bowled! Stumps shattered.";
            } else if (wtype === "LBW") {
                desc = "Plumb LBW! Hit on the pads in front of middle stump.";
            } else {
                desc = "Caught! Hit straight into the fielder's hands.";
            }
            this.preSelectedCommentaryMsg = `${state.striker.name} departs! ` + desc + ` Out for ${state.striker.runsScored} (${state.striker.ballsFaced} balls).`;
        } else if (result === "WIDE" || result === "NO BALL") {
            this.preSelectedCommentaryMsg = result === "WIDE" ? "Wide ball down the leg side, extra run conceded." : "No ball! Bowler overstepped the crease. Free hit coming up!";
        } else {
            this.preSelectedCommentaryMsg = commentaryLines[result][Math.floor(Math.random() * commentaryLines[result].length)];
        }

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
            const catchOut = this.preSelectedWicketType === "CATCH";
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
            } else if (this.preSelectedWicketType === "LBW") {
                targetX = 300;
                targetY = 242; // pad impact
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

        // Record ball into state.ballHistory (keeping last 9 deliveries)
        let ballRuns = 0;
        if (!isNaN(parseInt(result))) {
            ballRuns = parseInt(result);
        }
        const sector = this.getSectorFromCoords(targetX, targetY);
        state.ballHistory.push({ sector: sector, runs: ballRuns, isBoundary: ballRuns >= 4 });
        if (state.ballHistory.length > 9) {
            state.ballHistory.shift();
        }

        this.animateBall(targetX, targetY, animType, () => {
            this.processBallOutcome(result);
        });
    }

    animateBall(targetX, targetY, type, callback) {
        if (this.is3DViewActive) {
            this.animate3DBall(targetX, targetY, type, callback);
            return;
        }

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

        // Check if we should trigger an appeal (only for DOT/W and if not bypassed)
        if ((result === "DOT" || result === "W") && !this.bypassAppeal) {
            // 7.5% chance of a close appeal
            if (Math.random() < 0.075) {
                this.triggerCloseAppeal(result);
                return; // Suspend processing this ball!
            }
        }
        this.bypassAppeal = false;

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
                commentaryMsg = this.preSelectedCommentaryMsg || "Dot ball.";
                eventCode = "•";
            } else if (result === "W") {
                state.wickets += 1;
                state.striker.isOut = true;
                state.currentBowler.wickets += 1;
                state.partnershipRuns = 0; // Reset partnership on wicket down
                state.overEvents.push("W");
                state.recentBalls.push("W");
                
                commentaryMsg = this.preSelectedCommentaryMsg || `${state.striker.name} departs!`;
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
                commentaryMsg = this.preSelectedCommentaryMsg || "Runs scored.";
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

        // Trigger Opponent AI Tactical Fielding Engine
        this.evaluateTacticalAIFielding();

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
        if (this.is3DViewActive) {
            this.pauseMatchSimulation("Select Bowler");
            const available = state.bowlingTeam.filter(p => {
                const consec = p === state.lastBowler;
                const t20Limit = this.format === "T20" && (p.ballsBowled >= 24);
                return !consec && !t20Limit;
            });
            const selectionList = available.length > 0 ? available : state.bowlingTeam.filter(p => p !== state.lastBowler);

            const selectionMapped = selectionList.map(p => ({
                player: p,
                originalIndex: state.bowlingTeam.indexOf(p)
            }));

            this.show3DSelectionOverlay("BOWLER", selectionMapped, (originalIndex) => {
                state.currentBowler = state.bowlingTeam[originalIndex];
                this.logCommentary("Select Bowler", `${state.currentBowler.name} comes on to bowl over ${Math.floor(state.ballsBowled/6)+1}.`, "welcome");
                this.updateUI();
                this.drawField();
                this.isAnimating = false;
                this.disableActions(false);

                // Resume auto-simulation if active
                if (this.isSimulatingMatch) {
                    this.toggleMatchSimulation(true);
                }
            });
            return;
        }

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

        if (this.is3DViewActive) {
            this.pauseMatchSimulation("Wicket Down");
            const unbatted = state.battingTeam
                .map((p, originalIndex) => ({ player: p, originalIndex }))
                .filter(item => !item.player.hasBatted && !item.player.isOut);

            this.show3DSelectionOverlay("BATSMAN", unbatted, (originalIndex, mentality) => {
                const selected = state.battingTeam[originalIndex];
                selected.mentality = mentality;
                selected.hasBatted = true;
                state.striker = selected;
                this.logCommentary("Select Batter", `${state.striker.name} walks out to the crease under pressure with ${selected.mentality.toUpperCase()} mentality.`, "welcome");
                this.updateUI();
                this.drawField();
                this.isAnimating = false;
                this.disableActions(false);
            });
            return;
        }

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
    }

    handleStartMatchBtnClick() {
        const state = this.getCurrentState();
        if (!state) {
            this.startInnings();
        } else if (this.currentInningsIndex === 1 && !state.striker) {
            this.startSecondInningsAfterSelection();
        }
    }

    startSecondInningsAfterSelection() {
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

        if (this.is3DViewActive) {
            this.update3DHUD();
        }

        // CRICKBUZZ HEADER
        this.battingTeamNameUI.textContent = state.teamName;
        this.battingRunsWicketsUI.textContent = `${state.totalRuns}/${state.wickets}`;
        
        const overs = Math.floor(state.ballsBowled / 6);
        const balls = state.ballsBowled % 6;
        this.battingOversUI.textContent = `(${overs}.${balls} Overs)`;

        this.matchStatusLabel.textContent = `${state.teamName.includes("1st") ? "1st Innings" : "2nd Innings"}`;

        // Update DRS reviews counter
        const reviewsUI = document.getElementById("header-reviews-ui");
        if (reviewsUI) {
            reviewsUI.innerHTML = `<span>DRS: IND ${state.reviewsLeft}</span><span>|</span><span>AUS ${state.opponentReviewsLeft}</span>`;
        }

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
                { name: "Slip", x: 275, y: 225 },
                { name: "Point", x: 180, y: 250 },
                { name: "Cover", x: 210, y: 325 },
                { name: "Mid Off", x: 260, y: 405 },
                { name: "Mid On", x: 340, y: 405 },
                { name: "Mid Wicket", x: 390, y: 325 },
                { name: "Square Leg", x: 420, y: 250 },
                { name: "Fine Leg", x: 355, y: 205 },
                { name: "Third Man", x: 180, y: 160 }
            ],
            attacking: [
                { name: "Slip", x: 280, y: 225 },
                { name: "Point", x: 260, y: 245 },
                { name: "Cover", x: 250, y: 290 },
                { name: "Mid Off", x: 270, y: 345 },
                { name: "Mid On", x: 330, y: 345 },
                { name: "Mid Wicket", x: 350, y: 290 },
                { name: "Square Leg", x: 340, y: 245 },
                { name: "Fine Leg", x: 310, y: 220 },
                { name: "Third Man", x: 265, y: 215 }
            ],
            defensive: [
                { name: "Slip", x: 255, y: 175 },
                { name: "Point", x: 120, y: 250 },
                { name: "Cover", x: 150, y: 350 },
                { name: "Mid Off", x: 250, y: 470 },
                { name: "Mid On", x: 350, y: 470 },
                { name: "Mid Wicket", x: 450, y: 350 },
                { name: "Square Leg", x: 480, y: 250 },
                { name: "Fine Leg", x: 420, y: 180 },
                { name: "Third Man", x: 150, y: 160 }
            ],
            t20_powerplay_attacking: [
                { name: "Slip", x: 275, y: 225 },
                { name: "Gully", x: 250, y: 240 },
                { name: "Point", x: 190, y: 260 },
                { name: "Cover", x: 220, y: 320 },
                { name: "Mid Off", x: 270, y: 370 },
                { name: "Mid On", x: 330, y: 370 },
                { name: "Mid Wicket", x: 370, y: 320 },
                { name: "Deep Square Leg", x: 430, y: 250 },
                { name: "Deep Cover", x: 150, y: 340 }
            ],
            t20_powerplay_restrict: [
                { name: "Slip", x: 275, y: 225 },
                { name: "Point", x: 190, y: 260 },
                { name: "Cover", x: 220, y: 310 },
                { name: "Extra Cover", x: 240, y: 350 },
                { name: "Mid Off", x: 270, y: 380 },
                { name: "Mid On", x: 330, y: 380 },
                { name: "Square Leg", x: 400, y: 260 },
                { name: "Long Off", x: 230, y: 480 },
                { name: "Deep Sq Leg", x: 460, y: 250 }
            ],
            t20_middle_spin: [
                { name: "Slip", x: 280, y: 225 },
                { name: "Point", x: 200, y: 260 },
                { name: "Cover", x: 220, y: 320 },
                { name: "Mid Off", x: 270, y: 370 },
                { name: "Mid On", x: 330, y: 370 },
                { name: "Deep Cover", x: 140, y: 340 },
                { name: "Long Off", x: 230, y: 480 },
                { name: "Long On", x: 370, y: 480 },
                { name: "Deep Mid Wk", x: 440, y: 340 }
            ],
            t20_middle_pace: [
                { name: "Slip", x: 275, y: 225 },
                { name: "Point", x: 190, y: 260 },
                { name: "Cover", x: 220, y: 310 },
                { name: "Mid Off", x: 270, y: 370 },
                { name: "Mid On", x: 330, y: 370 },
                { name: "Deep Point", x: 120, y: 250 },
                { name: "Long Off", x: 230, y: 480 },
                { name: "Long On", x: 370, y: 480 },
                { name: "Deep Mid Wk", x: 440, y: 340 }
            ],
            t20_death_yorker: [
                { name: "Mid Off", x: 270, y: 370 },
                { name: "Mid On", x: 330, y: 370 },
                { name: "Fine Leg", x: 340, y: 220 },
                { name: "Cover", x: 230, y: 310 },
                { name: "Deep Point", x: 120, y: 250 },
                { name: "Deep Ex Cov", x: 140, y: 360 },
                { name: "Long Off", x: 230, y: 480 },
                { name: "Long On", x: 370, y: 480 },
                { name: "Deep Mid Wk", x: 450, y: 330 }
            ],
            test_attacking: [
                { name: "1st Slip", x: 280, y: 220 },
                { name: "2nd Slip", x: 265, y: 215 },
                { name: "3rd Slip", x: 250, y: 210 },
                { name: "Gully", x: 230, y: 240 },
                { name: "Point", x: 180, y: 250 },
                { name: "Cover", x: 210, y: 320 },
                { name: "Mid Off", x: 260, y: 405 },
                { name: "Mid On", x: 340, y: 405 },
                { name: "Square Leg", x: 410, y: 250 }
            ],
            test_defensive: [
                { name: "Slip", x: 275, y: 225 },
                { name: "Point", x: 170, y: 250 },
                { name: "Cover", x: 190, y: 330 },
                { name: "Mid Off", x: 250, y: 420 },
                { name: "Mid On", x: 350, y: 420 },
                { name: "Mid Wicket", x: 410, y: 330 },
                { name: "Square Leg", x: 430, y: 250 },
                { name: "Fine Leg", x: 370, y: 190 },
                { name: "Third Man", x: 170, y: 160 }
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
            this.updateAllFielderNames(state);
        }

        this.validateFieldingRules();
        this.drawField();
    }

    getSectorFromCoords(x, y) {
        const dx = x - 300;
        const dy = y - 240;
        let clockAngle = Math.atan2(dx, -dy) * (180 / Math.PI); // -180 to 180 (0 is Top)

        if (clockAngle >= 0 && clockAngle < 55) return 0;           // Top Right (55°)
        else if (clockAngle >= 55 && clockAngle < 90) return 1;     // Mid Right (35°)
        else if (clockAngle >= 90 && clockAngle < 125) return 2;    // Lower Right (35°)
        else if (clockAngle >= 125 && clockAngle <= 180) return 3;  // Bottom Right (55°)
        else if (clockAngle >= -180 && clockAngle < -125) return 4; // Bottom Left (55°)
        else if (clockAngle >= -125 && clockAngle < -90) return 5;  // Lower Left (35°)
        else if (clockAngle >= -90 && clockAngle < -55) return 6;   // Mid Left (35°)
        else return 7;                                              // Top Left (55°)
    }

    isGapInSector(state, sectorIdx) {
        const fielders = state.fielderPositions.filter(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === sectorIdx);
        // A sector (both 35° and 55°) is said to have a gap if there is no fielder in it at all
        return fielders.length === 0;
    }

    getSectorRunsLast9(state, sectorIdx) {
        if (!state || !state.ballHistory) return 0;
        return state.ballHistory
            .filter(b => b.sector === sectorIdx)
            .reduce((sum, b) => sum + (b.runs || 0), 0);
    }

    getLeastPerformingSector(state, candidateSectors) {
        if (!candidateSectors || candidateSectors.length === 0) return null;
        let minRuns = Infinity;
        let candidates = [];
        candidateSectors.forEach(sIdx => {
            const runs = this.getSectorRunsLast9(state, sIdx);
            if (runs < minRuns) {
                minRuns = runs;
                candidates = [sIdx];
            } else if (runs === minRuns) {
                candidates.push(sIdx);
            }
        });
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    getLeastPerformingDeep(state, candidateSectors) {
        if (!candidateSectors || candidateSectors.length === 0) return null;
        
        // Bypasses sectors with ZERO deep fielders entirely!
        const sectorsWithDeep = candidateSectors.filter(sIdx => {
            return state.fielderPositions.some(f => {
                if (f.isFixed) return false;
                if (this.getSectorFromCoords(f.x, f.y) !== sIdx) return false;
                const distCenter = Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2);
                return distCenter > 160;
            });
        });

        if (sectorsWithDeep.length === 0) return null;
        return this.getLeastPerformingSector(state, sectorsWithDeep);
    }

    getRandomDeepPosition(sectorIdx) {
        const sectorMidAngles = [27.5, 72.5, 107.5, 152.5, -152.5, -107.5, -72.5, -27.5];
        const sectorSizes = [55, 35, 35, 55, 55, 35, 35, 55];
        const midA = sectorMidAngles[sectorIdx];
        const size = sectorSizes[sectorIdx];

        const angularOffset = (Math.random() - 0.5) * (size - 12);
        const clockAngle = midA + angularOffset;
        const rad = clockAngle * (Math.PI / 180);

        // Place closer to boundary ropes (radius 245 to 265, NOT near inner ring 160)
        const dist = 245 + Math.random() * 20;

        const x = Math.round(300 + Math.sin(rad) * dist);
        const y = Math.round(240 - Math.cos(rad) * dist);
        return { x, y };
    }

    getRandomRingPosition(sectorIdx, state = null) {
        const sectorMidAngles = [27.5, 72.5, 107.5, 152.5, -152.5, -107.5, -72.5, -27.5];
        const sectorSizes = [55, 35, 35, 55, 55, 35, 35, 55];
        const midA = sectorMidAngles[sectorIdx];
        const size = sectorSizes[sectorIdx];

        let existingAngles = [];
        if (state && state.fielderPositions) {
            existingAngles = state.fielderPositions
                .filter(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === sectorIdx)
                .map(f => Math.atan2(f.x - 300, -(f.y - 240)) * (180 / Math.PI));
        }

        let bestAngle = midA;
        let maxMinDiff = -1;

        for (let trial = 0; trial < 25; trial++) {
            const angularOffset = (Math.random() - 0.5) * (size - 8);
            const candidateAngle = midA + angularOffset;

            if (existingAngles.length === 0) {
                bestAngle = candidateAngle;
                break;
            }

            let minDiff = Infinity;
            existingAngles.forEach(eA => {
                const diff = Math.abs(candidateAngle - eA);
                if (diff < minDiff) minDiff = diff;
            });

            if (minDiff >= 10) {
                bestAngle = candidateAngle;
                break;
            }

            if (minDiff > maxMinDiff) {
                maxMinDiff = minDiff;
                bestAngle = candidateAngle;
            }
        }

        const rad = bestAngle * (Math.PI / 180);

        // Place inside ring (radius 95 to 140)
        const dist = 95 + Math.random() * 45;

        const x = Math.round(300 + Math.sin(rad) * dist);
        const y = Math.round(240 - Math.cos(rad) * dist);
        return { x, y };
    }

    repairVacatedDeepGap(state, donorSectorIdx, vacatedFielder) {
        if (!state || !state.fielderPositions) return;

        const sectorMidAngles = [27.5, 72.5, 107.5, 152.5, -152.5, -107.5, -72.5, -27.5];
        const sectorSizes = [55, 35, 35, 55, 55, 35, 35, 55];
        const midA = sectorMidAngles[donorSectorIdx];
        const halfSize = sectorSizes[donorSectorIdx] / 2;

        const minA = midA - halfSize + 2;
        const maxA = midA + halfSize - 2;

        const fieldersInSector = state.fielderPositions.filter(f => !f.isFixed && f !== vacatedFielder && this.getSectorFromCoords(f.x, f.y) === donorSectorIdx);

        fieldersInSector.forEach(f => {
            const dx = f.x - 300;
            const dy = -(f.y - 240);
            let currentAngle = Math.atan2(dx, dy) * (180 / Math.PI);
            
            if (currentAngle < midA) {
                currentAngle = Math.min(maxA, currentAngle + 5);
            } else {
                currentAngle = Math.max(minA, currentAngle - 5);
            }

            const distCenter = Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2);
            const rad = currentAngle * (Math.PI / 180);
            f.x = Math.round(300 + Math.sin(rad) * distCenter);
            f.y = Math.round(240 - Math.cos(rad) * distCenter);
        });
    }

    evaluateTacticalAIFielding() {
        const state = this.getCurrentState();
        if (!state || !state.fielderPositions) return;

        // ONLY used by opponent team (when user is batting, or in AI vs AI match)
        if (!state.isUserBatting && this.isSimulatingMatch === false) return;

        if (!state.ballHistory || state.ballHistory.length < 2) return;

        // Fielding ONLY changes when there are 2 CONSECUTIVE boundaries in ONE sector in last 9 balls
        let targetSector = null;
        for (let i = 0; i < state.ballHistory.length - 1; i++) {
            const b1 = state.ballHistory[i];
            const b2 = state.ballHistory[i + 1];
            if (b1.isBoundary && b2.isBoundary && b1.sector === b2.sector) {
                targetSector = b1.sector;
            }
        }

        if (targetSector === null) return;

        // Check if there is a GAP in targetSector
        if (!this.isGapInSector(state, targetSector)) {
            return;
        }

        const overNum = Math.floor(state.ballsBowled / 6) + 1;
        const isPowerplay = this.format === "T20" && overNum <= 6;
        const maxDeepAllowed = isPowerplay ? 2 : 5;

        const currentDeepFielders = state.fielderPositions.filter(f => !f.isFixed && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
        const deepCapReached = currentDeepFielders.length >= maxDeepAllowed;

        const isTargetLeg = [0, 1, 2, 3].includes(targetSector);
        const isTargetBehindSquareLeg = [0, 1].includes(targetSector);
        const partnerSector = targetSector === 0 ? 1 : (targetSector === 1 ? 0 : null);

        const legFielders = state.fielderPositions.filter(f => !f.isFixed && f.x > 300);
        const maxLegFielders = legFielders.length >= 5;

        const hasDeepFielderInTarget = state.fielderPositions.some(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === targetSector && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);

        // We only put a fielder in deep if there is no deep fielder in this sector
        let placeDeep = !hasDeepFielderInTarget && (Math.random() < 0.6 || deepCapReached);

        if (placeDeep) {
            // DEEP FIELDER PLACEMENT
            if (deepCapReached) {
                // CASE 1 — Deep cap reached
                if (isTargetLeg && !isTargetBehindSquareLeg) {
                    const deepLegExist = [0, 1, 2, 3].some(s => {
                        return state.fielderPositions.some(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === s && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
                    });

                    if (maxLegFielders && !deepLegExist) {
                        const offDonor = this.getLeastPerformingDeep(state, [4, 5, 6, 7]);
                        if (offDonor !== null) {
                            const offFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === offDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
                            if (offFielder) {
                                const ringPos = this.getRandomRingPosition(offDonor, state);
                                offFielder.x = ringPos.x; offFielder.y = ringPos.y;
                            }
                        }
                        const legDonor = this.getLeastPerformingSector(state, [0, 1, 2, 3]);
                        const ringFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === legDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) <= 160);
                        if (ringFielder) {
                            const deepPos = this.getRandomDeepPosition(targetSector);
                            ringFielder.x = deepPos.x; ringFielder.y = deepPos.y;
                        }
                    } else if (maxLegFielders && deepLegExist) {
                        const legDeepDonor = this.getLeastPerformingDeep(state, [0, 1, 2, 3]);
                        if (legDeepDonor !== null) {
                            const legDeepFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === legDeepDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
                            if (legDeepFielder) {
                                const deepPos = this.getRandomDeepPosition(targetSector);
                                legDeepFielder.x = deepPos.x; legDeepFielder.y = deepPos.y;
                                this.repairVacatedDeepGap(state, legDeepDonor, legDeepFielder);
                            }
                        }
                    } else {
                        const deepDonor = this.getLeastPerformingDeep(state, [0, 1, 2, 3, 4, 5, 6, 7]);
                        if (deepDonor !== null) {
                            const deepFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === deepDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
                            if (deepFielder) {
                                const deepPos = this.getRandomDeepPosition(targetSector);
                                deepFielder.x = deepPos.x; deepFielder.y = deepPos.y;
                                this.repairVacatedDeepGap(state, deepDonor, deepFielder);
                            }
                        }
                    }
                } else if (isTargetBehindSquareLeg) {
                    const pairFielders = state.fielderPositions.filter(f => !f.isFixed && [0, 1].includes(this.getSectorFromCoords(f.x, f.y)));
                    const pairCount = pairFielders.length;
                    const partnerDeep = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === partnerSector && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);

                    if (pairCount >= 2 && partnerDeep) {
                        const deepPos = this.getRandomDeepPosition(targetSector);
                        partnerDeep.x = deepPos.x; partnerDeep.y = deepPos.y;
                    } else if (pairCount >= 2 && !partnerDeep && maxLegFielders) {
                        const otherLegDeepDonor = this.getLeastPerformingDeep(state, [2, 3]);
                        if (otherLegDeepDonor !== null) {
                            const deepFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === otherLegDeepDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
                            if (deepFielder) {
                                const deepPos = this.getRandomDeepPosition(targetSector);
                                deepFielder.x = deepPos.x; deepFielder.y = deepPos.y;
                                const partnerRing = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === partnerSector);
                                if (partnerRing) {
                                    const ringPos = this.getRandomRingPosition(otherLegDeepDonor, state);
                                    partnerRing.x = ringPos.x; partnerRing.y = ringPos.y;
                                }
                            }
                        } else {
                            const offDonor = this.getLeastPerformingDeep(state, [4, 5, 6, 7]);
                            if (offDonor !== null) {
                                const offFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === offDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
                                if (offFielder) {
                                    const rPos = this.getRandomRingPosition(offDonor, state);
                                    offFielder.x = rPos.x; offFielder.y = rPos.y;
                                }
                            }
                            const legDonor = this.getLeastPerformingSector(state, [2, 3]);
                            const legRing = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === legDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) <= 160);
                            if (legRing) {
                                const deepPos = this.getRandomDeepPosition(targetSector);
                                legRing.x = deepPos.x; legRing.y = deepPos.y;
                            }
                            const partnerRing = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === partnerSector);
                            if (partnerRing && legDonor !== null) {
                                const rPos = this.getRandomRingPosition(legDonor, state);
                                partnerRing.x = rPos.x; partnerRing.y = rPos.y;
                            }
                        }
                    } else if (pairCount >= 2 && !partnerDeep && !maxLegFielders) {
                        const deepDonor = this.getLeastPerformingDeep(state, [2, 3, 4, 5, 6, 7]);
                        if (deepDonor !== null) {
                            const deepFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === deepDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
                            if (deepFielder) {
                                const deepPos = this.getRandomDeepPosition(targetSector);
                                deepFielder.x = deepPos.x; deepFielder.y = deepPos.y;
                                const partnerRing = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === partnerSector);
                                if (partnerRing) {
                                    const rPos = this.getRandomRingPosition(deepDonor, state);
                                    partnerRing.x = rPos.x; partnerRing.y = rPos.y;
                                }
                            }
                        }
                    } else if (pairCount <= 1 && maxLegFielders) {
                        if (partnerDeep) {
                            const deepPos = this.getRandomDeepPosition(targetSector);
                            partnerDeep.x = deepPos.x; partnerDeep.y = deepPos.y;
                        } else {
                            const otherLegDeepDonor = this.getLeastPerformingDeep(state, [2, 3]);
                            if (otherLegDeepDonor !== null) {
                                const deepFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === otherLegDeepDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
                                if (deepFielder) {
                                    const deepPos = this.getRandomDeepPosition(targetSector);
                                    deepFielder.x = deepPos.x; deepFielder.y = deepPos.y;
                                    this.repairVacatedDeepGap(state, otherLegDeepDonor, deepFielder);
                                }
                            } else {
                                const offDonor = this.getLeastPerformingDeep(state, [4, 5, 6, 7]);
                                if (offDonor !== null) {
                                    const offFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === offDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
                                    if (offFielder) {
                                        const rPos = this.getRandomRingPosition(offDonor, state);
                                        offFielder.x = rPos.x; offFielder.y = rPos.y;
                                    }
                                }
                                const legDonor = this.getLeastPerformingSector(state, [2, 3]);
                                const legRing = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === legDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) <= 160);
                                if (legRing) {
                                    const deepPos = this.getRandomDeepPosition(targetSector);
                                    legRing.x = deepPos.x; legRing.y = deepPos.y;
                                }
                            }
                        }
                    } else if (pairCount <= 1 && !maxLegFielders) {
                        const offDonor = this.getLeastPerformingDeep(state, [0, 1, 2, 3, 4, 5, 6, 7].filter(s => s !== targetSector));
                        if (offDonor !== null) {
                            const dFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === offDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
                            if (dFielder) {
                                const rPos = this.getRandomRingPosition(offDonor, state);
                                dFielder.x = rPos.x; dFielder.y = rPos.y;
                            }
                        }
                        const secDonor = this.getLeastPerformingSector(state, [0, 1, 2, 3, 4, 5, 6, 7].filter(s => s !== targetSector));
                        const rFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === secDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) <= 160);
                        if (rFielder) {
                            const deepPos = this.getRandomDeepPosition(targetSector);
                            rFielder.x = deepPos.x; rFielder.y = deepPos.y;
                        }
                    }
                } else {
                    // 1.2 — Target is Offside
                    const deepDonor = this.getLeastPerformingDeep(state, [0, 1, 2, 3, 4, 5, 6, 7].filter(s => s !== targetSector));
                    if (deepDonor !== null) {
                        const deepFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === deepDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) > 160);
                        if (deepFielder) {
                            const deepPos = this.getRandomDeepPosition(targetSector);
                            deepFielder.x = deepPos.x; deepFielder.y = deepPos.y;
                            this.repairVacatedDeepGap(state, deepDonor, deepFielder);
                        }
                    }
                }
            } else {
                // CASE 2 — Deep cap not reached
                if (isTargetLeg) {
                    if (maxLegFielders) {
                        if (!isTargetBehindSquareLeg) {
                            const legDonor = this.getLeastPerformingSector(state, [0, 1, 2, 3].filter(s => s !== targetSector));
                            const rFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === legDonor);
                            if (rFielder) {
                                const deepPos = this.getRandomDeepPosition(targetSector);
                                rFielder.x = deepPos.x; rFielder.y = deepPos.y;
                            }
                        } else {
                            const pairFielders = state.fielderPositions.filter(f => !f.isFixed && [0, 1].includes(this.getSectorFromCoords(f.x, f.y)));
                            if (pairFielders.length >= 2) {
                                const partnerFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === partnerSector);
                                if (partnerFielder) {
                                    const deepPos = this.getRandomDeepPosition(targetSector);
                                    partnerFielder.x = deepPos.x; partnerFielder.y = deepPos.y;
                                }
                            } else {
                                const legDonor = this.getLeastPerformingSector(state, [2, 3]);
                                const rFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === legDonor);
                                if (rFielder) {
                                    const deepPos = this.getRandomDeepPosition(targetSector);
                                    rFielder.x = deepPos.x; rFielder.y = deepPos.y;
                                }
                            }
                        }
                    } else {
                        if (!isTargetBehindSquareLeg) {
                            const donor = this.getLeastPerformingSector(state, [4, 5, 6, 7]) || this.getLeastPerformingSector(state, [0, 1, 2, 3].filter(s => s !== targetSector));
                            const rFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === donor);
                            if (rFielder) {
                                const deepPos = this.getRandomDeepPosition(targetSector);
                                rFielder.x = deepPos.x; rFielder.y = deepPos.y;
                            }
                        } else {
                            const pairFielders = state.fielderPositions.filter(f => !f.isFixed && [0, 1].includes(this.getSectorFromCoords(f.x, f.y)));
                            if (pairFielders.length >= 2) {
                                const partnerFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === partnerSector);
                                if (partnerFielder) {
                                    const deepPos = this.getRandomDeepPosition(targetSector);
                                    partnerFielder.x = deepPos.x; partnerFielder.y = deepPos.y;
                                }
                            } else {
                                const donor = this.getLeastPerformingSector(state, [4, 5, 6, 7]) || this.getLeastPerformingSector(state, [2, 3]);
                                const rFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === donor);
                                if (rFielder) {
                                    const deepPos = this.getRandomDeepPosition(targetSector);
                                    rFielder.x = deepPos.x; rFielder.y = deepPos.y;
                                }
                            }
                        }
                    }
                } else {
                    const offFielders = state.fielderPositions.filter(f => !f.isFixed && f.x <= 300);
                    const maxOffFielders = offFielders.length >= 5;

                    if (maxOffFielders) {
                        const offDonor = this.getLeastPerformingSector(state, [4, 5, 6, 7].filter(s => s !== targetSector));
                        const rFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === offDonor);
                        if (rFielder) {
                            const deepPos = this.getRandomDeepPosition(targetSector);
                            rFielder.x = deepPos.x; rFielder.y = deepPos.y;
                        }
                    } else {
                        const donor = this.getLeastPerformingSector(state, [0, 1, 2, 3]) || this.getLeastPerformingSector(state, [4, 5, 6, 7].filter(s => s !== targetSector));
                        const rFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === donor);
                        if (rFielder) {
                            const deepPos = this.getRandomDeepPosition(targetSector);
                            rFielder.x = deepPos.x; rFielder.y = deepPos.y;
                        }
                    }
                }
            }
        } else {
            // RING FIELDER PLACEMENT
            if (isTargetLeg) {
                if (maxLegFielders) {
                    const legDonor = this.getLeastPerformingSector(state, [0, 1, 2, 3].filter(s => s !== targetSector));
                    const rFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === legDonor && Math.sqrt((f.x - 300) ** 2 + (f.y - 300) ** 2) <= 160);
                    if (rFielder) {
                        const ringPos = this.getRandomRingPosition(targetSector, state);
                        rFielder.x = ringPos.x; rFielder.y = ringPos.y;
                    }
                } else {
                    const donor = this.getLeastPerformingSector(state, [0, 1, 2, 3, 4, 5, 6, 7].filter(s => s !== targetSector));
                    const rFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === donor);
                    if (rFielder) {
                        const ringPos = this.getRandomRingPosition(targetSector, state);
                        rFielder.x = ringPos.x; rFielder.y = ringPos.y;
                    }
                }
            } else if (isTargetBehindSquareLeg) {
                const pairFielders = state.fielderPositions.filter(f => !f.isFixed && [0, 1].includes(this.getSectorFromCoords(f.x, f.y)));
                if (pairFielders.length >= 2) {
                    const partnerFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === partnerSector);
                    if (partnerFielder) {
                        const ringPos = this.getRandomRingPosition(targetSector, state);
                        partnerFielder.x = ringPos.x; partnerFielder.y = ringPos.y;
                    }
                } else {
                    const donor = this.getLeastPerformingSector(state, [0, 1, 2, 3, 4, 5, 6, 7].filter(s => s !== targetSector));
                    const rFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === donor);
                    if (rFielder) {
                        const ringPos = this.getRandomRingPosition(targetSector, state);
                        rFielder.x = ringPos.x; rFielder.y = ringPos.y;
                    }
                }
            } else {
                const donor = this.getLeastPerformingSector(state, [0, 1, 2, 3, 4, 5, 6, 7].filter(s => s !== targetSector));
                const rFielder = state.fielderPositions.find(f => !f.isFixed && this.getSectorFromCoords(f.x, f.y) === donor);
                if (rFielder) {
                    const ringPos = this.getRandomRingPosition(targetSector, state);
                    rFielder.x = ringPos.x; rFielder.y = ringPos.y;
                }
            }
        }

        this.updateAllFielderNames(state);
        this.validateFieldingRules();
        this.drawField();
    }

    getCricketPositionName(x, y) {
        if (x === 300 && y === 205) return "Keeper";
        if (x === 300 && y === 380) return "Bowler";

        const dx = x - 300;
        const dy = y - 240; // Striker is at y = 240
        const distStriker = Math.sqrt(dx * dx + dy * dy);
        const distCenter = Math.sqrt((x - 300) * (x - 300) + (y - 300) * (y - 300));
        const isDeep = distCenter > 160;
        const isVeryClose = distStriker < 65;

        // Angle clockwise from Bowler direction (+Y)
        // dx < 0 (left of field) -> clockAngle < 0 (OFF SIDE)
        // dx > 0 (right of field) -> clockAngle > 0 (LEG SIDE)
        const clockAngle = Math.atan2(dx, dy) * (180 / Math.PI);

        // OFF SIDE (Left of field, x < 300)
        if (clockAngle < 0) {
            if (clockAngle >= -20) {
                return isDeep ? "Long Off" : "Mid Off";
            } else if (clockAngle >= -50) {
                return isDeep ? "Deep Ex Cov" : "Extra Cover";
            } else if (clockAngle >= -80) {
                return isDeep ? "Deep Cover" : "Cover";
            } else if (clockAngle >= -110) {
                return isDeep ? "Deep Point" : "Point";
            } else if (clockAngle >= -135) {
                if (isVeryClose) return "Gully";
                return isDeep ? "Deep Bwd Pt" : "Bwd Point";
            } else if (clockAngle >= -165) {
                if (isVeryClose) return "Slip";
                return isDeep ? "Deep 3rd Man" : "Third Man";
            } else {
                if (isVeryClose) return "Slip";
                return "Third Man";
            }
        } 
        // LEG SIDE (Right of field, x >= 300)
        else {
            if (clockAngle <= 20) {
                return isDeep ? "Long On" : "Mid On";
            } else if (clockAngle <= 50) {
                return isDeep ? "Long On" : "Mid On";
            } else if (clockAngle <= 80) {
                return isDeep ? "Cow Corner" : "Mid Wicket";
            } else if (clockAngle <= 110) {
                return isDeep ? "Deep Sq Leg" : "Square Leg";
            } else if (clockAngle <= 135) {
                return isDeep ? "Deep Bwd Sq Leg" : "Bwd Sq Leg";
            } else if (clockAngle <= 165) {
                if (isVeryClose) return "Leg Slip";
                return isDeep ? "Deep Fine Leg" : "Fine Leg";
            } else {
                if (isVeryClose) return "Leg Slip";
                return "Fine Leg";
            }
        }
    }

    updateAllFielderNames(state) {
        if (!state || !state.fielderPositions) return;

        state.fielderPositions.forEach(f => {
            if (!f.isFixed) {
                f.name = this.getCricketPositionName(f.x, f.y);
            }
        });

        // Disambiguate duplicate Slips
        const slips = state.fielderPositions.filter(f => f.name === "Slip");
        if (slips.length > 1) {
            slips.sort((a, b) => Math.abs(a.x - 300) - Math.abs(b.x - 300));
            slips.forEach((s, idx) => {
                s.name = `${idx + 1}${idx === 0 ? 'st' : idx === 1 ? 'nd' : 'rd'} Slip`;
            });
        }
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
            if (state) {
                state.fieldingPreset = "custom";
                this.updateAllFielderNames(state);
            }

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
            const stateTouch = this.getCurrentState();
            if (stateTouch) {
                stateTouch.fieldingPreset = "custom";
                this.updateAllFielderNames(stateTouch);
            }

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

        // 1. Keep 8 Fixed Sector Dotted Rays from Striker (300, 240) to Outer Boundary
        const rayAngles = [0, 55, 90, 125, 180, -125, -90, -55];
        rayAngles.forEach(clockAngle => {
            const rad = clockAngle * Math.PI / 180;
            const cosVal = Math.cos(rad);
            const distToBoundary = Math.sqrt(3600 * cosVal * cosVal + 74800) - 60 * cosVal;

            const dx = Math.sin(rad) * distToBoundary;
            const dy = -cosVal * distToBoundary;
            const endX = 300 + dx;
            const endY = 240 + dy;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", "300");
            line.setAttribute("y1", "240");
            line.setAttribute("x2", endX.toFixed(1));
            line.setAttribute("y2", endY.toFixed(1));
            line.setAttribute("stroke", "rgba(255, 255, 255, 0.4)");
            line.setAttribute("stroke-width", "1.5");
            line.setAttribute("stroke-dasharray", "4 4");
            this.svgSectorLines.appendChild(line);
        });

        // 2. Render Dynamic Sector Gap Angles between Adjacent Fielders (Batsman POV)
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
            if (gap >= 45) {
                statusClass = "open";
            } else if (gap >= 28) {
                statusClass = "partial";
            }

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", labelX.toFixed(1));
            text.setAttribute("y", labelY.toFixed(1));
            text.setAttribute("class", `gap-label ${statusClass}`);
            text.textContent = `${Math.round(gap)}°${isDeepCovered ? '(D)' : ''}`;
            this.svgGapLabels.appendChild(text);
        }
    }

    triggerCloseAppeal(originalResult) {
        const state = this.getCurrentState();
        if (!state) return;

        this.activeAppeal = {
            originalResult: originalResult,
            appealType: Math.random() < 0.6 ? "LBW" : "Caught Behind",
            actualOutcome: originalResult === "W" ? "OUT" : "NOT OUT"
        };

        const isUmpireCorrect = Math.random() < 0.75;
        this.activeAppeal.umpireDecision = isUmpireCorrect ? this.activeAppeal.actualOutcome : (this.activeAppeal.actualOutcome === "OUT" ? "NOT OUT" : "OUT");

        if (this.activeAppeal.appealType === "Caught Behind") {
            this.activeAppeal.snickoSpike = this.activeAppeal.actualOutcome === "OUT";
            this.activeAppeal.pitching = "In Line";
            this.activeAppeal.impact = "In Line";
            this.activeAppeal.wickets = "Missing";
        } else {
            this.activeAppeal.snickoSpike = false;
            if (this.activeAppeal.actualOutcome === "OUT") {
                this.activeAppeal.pitching = Math.random() < 0.9 ? "In Line" : "Outside Off";
                this.activeAppeal.impact = "In Line";
                this.activeAppeal.wickets = Math.random() < 0.8 ? "Hitting" : "Umpire's Call";
            } else {
                const rand = Math.random();
                if (rand < 0.4) {
                    this.activeAppeal.pitching = "Outside Leg";
                    this.activeAppeal.impact = "In Line";
                    this.activeAppeal.wickets = "Hitting";
                } else if (rand < 0.7) {
                    this.activeAppeal.pitching = "In Line";
                    this.activeAppeal.impact = "Outside";
                    this.activeAppeal.wickets = "Hitting";
                } else {
                    this.activeAppeal.pitching = "In Line";
                    this.activeAppeal.impact = "In Line";
                    this.activeAppeal.wickets = "Missing";
                }
            }
        }

        this.pauseMatchSimulation("Appeal");

        document.getElementById("appeal-type-text").textContent = `Loud appeal for ${this.activeAppeal.appealType}!`;
        const decisionText = document.getElementById("umpire-decision-text");
        decisionText.textContent = this.activeAppeal.umpireDecision;
        
        if (this.activeAppeal.umpireDecision === "OUT") {
            decisionText.style.color = "#E74C3C";
        } else {
            decisionText.style.color = "#2ECC71";
        }

        const userReviews = state.reviewsLeft;
        const oppReviews = state.opponentReviewsLeft;
        document.getElementById("appeal-reviews-info").textContent = `Reviews Left: IND (User) ${userReviews} | AUS (Opponent) ${oppReviews}`;

        this.appealModal.classList.remove("hidden");

        const isUserTurnToReview = (this.activeAppeal.umpireDecision === "OUT" && state.isUserBatting) ||
                                   (this.activeAppeal.umpireDecision === "NOT OUT" && !state.isUserBatting);

        if (isUserTurnToReview) {
            this.btnDrsReview.disabled = userReviews <= 0;
            this.btnDrsReview.style.opacity = userReviews <= 0 ? 0.5 : 1;
            this.btnDrsAccept.disabled = false;
            this.btnDrsAccept.style.opacity = 1;
            this.btnDrsReview.textContent = `Review Decision (DRS) (${userReviews})`;
        } else {
            this.btnDrsReview.disabled = true;
            this.btnDrsReview.style.opacity = 0.5;
            this.btnDrsAccept.disabled = true;
            this.btnDrsAccept.style.opacity = 0.5;
            this.btnDrsReview.textContent = "Review (Opponent Turn)";
            
            setTimeout(() => {
                this.handleOpponentReviewDecision();
            }, 1800);
        }
    }

    handleOpponentReviewDecision() {
        const state = this.getCurrentState();
        if (!state || !this.activeAppeal) return;

        const oppReviews = state.opponentReviewsLeft;
        let aiWillReview = false;

        if (oppReviews > 0) {
            const umpireError = this.activeAppeal.umpireDecision !== this.activeAppeal.actualOutcome;
            if (umpireError) {
                aiWillReview = Math.random() < 0.85;
            } else {
                if (this.activeAppeal.wickets === "Umpire's Call") {
                    aiWillReview = Math.random() < 0.3;
                }
            }
        }

        if (aiWillReview) {
            state.opponentReviewsLeft--;
            this.logCommentary("Match", "AUS (Opponent) requests a review! Umpire signals DRS.", "welcome");
            this.appealModal.classList.add("hidden");
            this.runDRSReviewProcess(false);
        } else {
            this.logCommentary("Match", `AUS (Opponent) accepts the umpire's decision.`, "welcome");
            this.appealModal.classList.add("hidden");
            
            const resolved = this.activeAppeal.umpireDecision === "OUT" ? "W" : "DOT";
            this.activeAppeal = null;
            this.bypassAppeal = true;
            this.processBallOutcome(resolved);
        }
    }

    executeUserReview() {
        const state = this.getCurrentState();
        if (!state || !this.activeAppeal) return;

        if (state.reviewsLeft <= 0) return;
        state.reviewsLeft--;

        this.logCommentary("Match", "IND (User) requests a player review! The umpire signals DRS.", "welcome");
        this.appealModal.classList.add("hidden");
        this.runDRSReviewProcess(true);
    }

    executeUserAccept() {
        if (!this.activeAppeal) return;
        
        this.appealModal.classList.add("hidden");
        
        const resolved = this.activeAppeal.umpireDecision === "OUT" ? "W" : "DOT";
        this.activeAppeal = null;
        this.bypassAppeal = true;
        this.processBallOutcome(resolved);
    }

    runDRSReviewProcess(isUserReview) {
        const state = this.getCurrentState();
        if (!state || !this.activeAppeal) return;

        this.drsModal.classList.remove("hidden");
        document.getElementById("drs-snicko-screen").classList.remove("hidden");
        document.getElementById("drs-hawkeye-screen").classList.add("hidden");
        document.getElementById("drs-verdict-screen").classList.add("hidden");

        const appeal = this.activeAppeal;

        const hasSpike = appeal.snickoSpike;
        this.startSnickoWaveAnimation(hasSpike);
        document.getElementById("drs-snicko-status").textContent = "Checking UltraEdge...";

        setTimeout(() => {
            if (hasSpike) {
                document.getElementById("drs-snicko-status").textContent = "Spike on UltraEdge! Caught Behind - OUT!";
                
                setTimeout(() => {
                    this.showDRSVerdictScreen(isUserReview, "OUT");
                }, 1500);
            } else {
                document.getElementById("drs-snicko-status").textContent = "Flatline on UltraEdge. Proceeding to Hawkeye...";

                setTimeout(() => {
                    this.runDRSHawkeyeProcess(isUserReview);
                }, 1500);
            }
        }, 2000);
    }

    startSnickoWaveAnimation(hasSpike) {
        const path = document.getElementById("snicko-wave-path");
        const ballDot = document.getElementById("snicko-ball-dot");
        if (!path || !ballDot) return;

        ballDot.style.opacity = 1;
        ballDot.style.left = "60px";
        ballDot.style.top = "38px";

        setTimeout(() => {
            ballDot.style.left = "260px";
        }, 50);

        let startTime = performance.now();
        let animationFrameId;

        const animateWave = (now) => {
            const elapsed = now - startTime;
            if (elapsed > 1800) {
                cancelAnimationFrame(animationFrameId);
                ballDot.style.opacity = 0;
                return;
            }

            let pathD = "M 0 40";
            for (let x = 1; x <= 450; x++) {
                let y = 40;
                y += Math.sin(x / 6 + now / 40) * 1.5 + (Math.random() - 0.5) * 0.8;

                if (hasSpike) {
                    const spikeX = 225;
                    const distToSpike = Math.abs(x - spikeX);
                    
                    if (elapsed > 700 && elapsed < 1100) {
                        const intensity = Math.sin(x / 1.5 + now / 10) * 22;
                        const envelope = Math.exp(-distToSpike / 12);
                        y += intensity * envelope;
                    }
                }
                pathD += ` L ${x} ${y}`;
            }

            path.setAttribute("d", pathD);
            animationFrameId = requestAnimationFrame(animateWave);
        };

        animationFrameId = requestAnimationFrame(animateWave);
    }

    runDRSHawkeyeProcess(isUserReview) {
        const appeal = this.activeAppeal;
        document.getElementById("drs-snicko-screen").classList.add("hidden");
        document.getElementById("drs-hawkeye-screen").classList.remove("hidden");
        
        const pBadge = document.getElementById("drs-pitching-badge");
        const iBadge = document.getElementById("drs-impact-badge");
        const wBadge = document.getElementById("drs-wickets-badge");
        
        pBadge.textContent = "Pending"; pBadge.className = "badge";
        iBadge.textContent = "Pending"; iBadge.className = "badge";
        wBadge.textContent = "Pending"; wBadge.className = "badge";

        document.getElementById("drs-hawkeye-status").textContent = "Projecting trajectory...";
        this.startHawkeyeAnimation(appeal.pitching, appeal.impact, appeal.wickets);

        setTimeout(() => {
            pBadge.textContent = appeal.pitching;
            pBadge.className = appeal.pitching === "In Line" ? "badge bg-success" : "badge bg-danger";
            document.getElementById("drs-hawkeye-status").textContent = `Pitching: ${appeal.pitching}`;
        }, 1200);

        setTimeout(() => {
            iBadge.textContent = appeal.impact;
            iBadge.className = appeal.impact === "In Line" ? "badge bg-success" : "badge bg-danger";
            document.getElementById("drs-hawkeye-status").textContent = `Impact: ${appeal.impact}`;
        }, 2400);

        setTimeout(() => {
            wBadge.textContent = appeal.wickets;
            if (appeal.wickets === "Hitting") {
                wBadge.className = "badge bg-success";
            } else if (appeal.wickets === "Missing") {
                wBadge.className = "badge bg-danger";
            } else {
                wBadge.className = "badge bg-warning";
                wBadge.style.backgroundColor = "rgba(243, 156, 18, 0.2)";
                wBadge.style.color = "#f39c12";
                wBadge.style.border = "1px solid rgba(243, 156, 18, 0.4)";
            }
            document.getElementById("drs-hawkeye-status").textContent = `Wickets: ${appeal.wickets}`;
        }, 3600);

        setTimeout(() => {
            let finalVerdict = "OUT";
            
            if (appeal.pitching === "Outside Leg" || appeal.pitching === "Outside Off") {
                finalVerdict = "NOT OUT";
            } else if (appeal.impact === "Outside") {
                finalVerdict = "NOT OUT";
            } else if (appeal.wickets === "Missing") {
                finalVerdict = "NOT OUT";
            }

            const isUmpiresCall = appeal.wickets === "Umpire's Call" || appeal.impact === "Umpire's Call";
            if (isUmpiresCall) {
                finalVerdict = appeal.umpireDecision;
            }

            this.showDRSVerdictScreen(isUserReview, finalVerdict, isUmpiresCall);
        }, 4800);
    }

    startHawkeyeAnimation(pitching, impact, wickets) {
        const impactDot = document.getElementById("hawkeye-ball-impact");
        if (!impactDot) return;

        impactDot.style.display = "block";
        impactDot.setAttribute("cx", "50");
        impactDot.setAttribute("cy", "140");
        impactDot.setAttribute("r", "9");
        impactDot.setAttribute("fill", "#e74c3c");

        let targetX = 50;
        if (pitching === "Outside Leg") targetX = 20;
        else if (pitching === "Outside Off") targetX = 80;

        let targetY = 80;
        if (wickets === "Missing") {
            targetY = 15;
        }

        let startTime = performance.now();
        const animateBall = (now) => {
            const elapsed = now - startTime;
            if (elapsed > 1200) {
                return;
            }
            
            const progress = elapsed / 1200;
            const currentX = 50 + (targetX - 50) * progress;
            const height = 40 * Math.sin(progress * Math.PI);
            const currentY = 140 + (targetY - 140) * progress - height;
            const currentR = 9 - 4 * progress;

            impactDot.setAttribute("cx", currentX.toString());
            impactDot.setAttribute("cy", currentY.toString());
            impactDot.setAttribute("r", currentR.toString());

            requestAnimationFrame(animateBall);
        };
        requestAnimationFrame(animateBall);
    }

    showDRSVerdictScreen(isUserReview, finalVerdict, isUmpiresCall = false) {
        const state = this.getCurrentState();
        const appeal = this.activeAppeal;
        
        document.getElementById("drs-snicko-screen").classList.add("hidden");
        document.getElementById("drs-hawkeye-screen").classList.add("hidden");
        document.getElementById("drs-verdict-screen").classList.remove("hidden");

        const verdictTitle = document.getElementById("drs-verdict-text");
        verdictTitle.textContent = finalVerdict;
        verdictTitle.style.color = finalVerdict === "OUT" ? "#E74C3C" : "#2ECC71";

        const hasOverturned = finalVerdict !== appeal.umpireDecision;
        
        let decisionSummary = "";
        if (hasOverturned) {
            decisionSummary = "Decision OVERTURNED! Umpire call reversed.";
            if (isUserReview) {
                state.reviewsLeft++;
            } else {
                state.opponentReviewsLeft++;
            }
        } else {
            decisionSummary = "Decision UPHELD! Original decision stands.";
            if (isUmpiresCall) {
                decisionSummary += " Review Retained (Umpire's Call).";
                if (isUserReview) {
                    state.reviewsLeft++;
                } else {
                    state.opponentReviewsLeft++;
                }
            }
        }

        this.logCommentary("Match", `DRS Verdict: ${finalVerdict}. ${decisionSummary}`, "welcome");

        this.resolvedDRSOutcome = finalVerdict === "OUT" ? "W" : "DOT";
        this.updateUI();
    }

    closeDrsVisualizer() {
        this.drsModal.classList.add("hidden");

        const outcome = this.resolvedDRSOutcome;
        this.activeAppeal = null;
        this.resolvedDRSOutcome = null;

        this.bypassAppeal = true;
        this.processBallOutcome(outcome);
    }


    // =========================================================
    // 3D WEBGL GRAPHICS (THREE.JS) - HIGH HIGH GRAPHICS
    // =========================================================


    toggle3DView() {
        this.is3DViewActive = !this.is3DViewActive;

        if (this.is3DViewActive) {
            this.cricketField.classList.add("hidden");
            this.threeCanvasContainer.classList.remove("hidden");
            this.btnToggleView3D.innerHTML = '<i class="fa-solid fa-compass"></i> 2D View';
            this.btnToggleView3D.style.background = "rgba(46, 204, 113, 0.25)";
            this.btnToggleView3D.style.borderColor = "rgba(46, 204, 113, 0.4)";
            this.btnToggleView3D.style.color = "#a3e635";

            this.init3DScene();
            this.draw3DField();
            this.update3DHUD();
        } else {
            this.cricketField.classList.remove("hidden");
            this.threeCanvasContainer.classList.add("hidden");
            this.btnToggleView3D.innerHTML = '<i class="fa-solid fa-cube"></i> 3D View';
            this.btnToggleView3D.style.background = "rgba(25, 118, 210, 0.25)";
            this.btnToggleView3D.style.borderColor = "rgba(25, 118, 210, 0.4)";
            this.btnToggleView3D.style.color = "#90CAF9";
        }
    }

    toggle3DFullscreen() {
        const container = this.threeCanvasContainer;
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    resize3DCanvas() {
        if (!this.is3DViewActive || !this.threeRenderer || !this.threeCamera) return;
        
        let width = this.threeCanvasContainer.clientWidth;
        let height = this.threeCanvasContainer.clientHeight;
        
        if (document.fullscreenElement) {
            width = window.innerWidth;
            height = window.innerHeight;
        }

        this.threeCamera.aspect = width / height;
        this.threeCamera.updateProjectionMatrix();
        this.threeRenderer.setSize(width, height);
    }

    createHumanPlayer(shirtColor, isStriker = false) {
        const playerGroup = new THREE.Group();

        // 1. Torso/Jersey
        const torsoGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.5, 8);
        const torsoMat = new THREE.MeshLambertMaterial({ color: shirtColor });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.y = 0.52;
        torso.castShadow = true;
        torso.receiveShadow = true;
        playerGroup.add(torso);

        // 2. Head
        const headGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const headMat = new THREE.MeshLambertMaterial({ color: 0xffcc99 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.83;
        head.castShadow = true;
        playerGroup.add(head);

        // 3. Helmet
        const helmetGeo = new THREE.SphereGeometry(0.09, 8, 8, 0, Math.PI * 2, 0, Math.PI / 1.7);
        const helmetMat = new THREE.MeshLambertMaterial({ color: shirtColor });
        const helmet = new THREE.Mesh(helmetGeo, helmetMat);
        helmet.position.y = 0.85;
        helmet.rotation.x = -0.12;
        helmet.castShadow = true;
        playerGroup.add(helmet);

        // 4. Arms (Stance dependent)
        const armGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.32, 8);
        const armMat = new THREE.MeshLambertMaterial({ color: shirtColor });
        
        if (isStriker) {
            // Attacking grip stance: arms forward holding bat
            const leftArm = new THREE.Mesh(armGeo, armMat);
            leftArm.position.set(-0.1, 0.48, 0.12);
            leftArm.rotation.set(-Math.PI / 3, 0, Math.PI / 4);
            leftArm.castShadow = true;
            playerGroup.add(leftArm);

            const rightArm = new THREE.Mesh(armGeo, armMat);
            rightArm.position.set(0.08, 0.42, 0.12);
            rightArm.rotation.set(-Math.PI / 4, 0, -Math.PI / 6);
            rightArm.castShadow = true;
            playerGroup.add(rightArm);

            // Add the bat directly to the player group in hands
            const bat = this.createDetailedBat();
            bat.position.set(0.08, 0.15, 0.22);
            bat.rotation.set(-Math.PI / 6, 0, Math.PI / 12);
            playerGroup.add(bat);
            playerGroup.userData = { bat: bat };
        } else {
            // Standard standing arms
            const leftArm = new THREE.Mesh(armGeo, armMat);
            leftArm.position.set(-0.14, 0.52, 0);
            leftArm.rotation.z = Math.PI / 10;
            leftArm.castShadow = true;
            playerGroup.add(leftArm);

            const rightArm = new THREE.Mesh(armGeo, armMat);
            rightArm.position.set(0.14, 0.52, 0);
            rightArm.rotation.z = -Math.PI / 10;
            rightArm.castShadow = true;
            playerGroup.add(rightArm);
        }

        // 5. Pants & Pads (Legs)
        const padGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.35, 8);
        const padMat = new THREE.MeshLambertMaterial({ color: 0xf2f2f2 }); // white pads

        const leftLeg = new THREE.Mesh(padGeo, padMat);
        leftLeg.position.set(-0.06, 0.175, 0);
        leftLeg.castShadow = true;
        leftLeg.receiveShadow = true;
        playerGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(padGeo, padMat);
        rightLeg.position.set(0.06, 0.175, 0);
        rightLeg.castShadow = true;
        rightLeg.receiveShadow = true;
        playerGroup.add(rightLeg);

        return playerGroup;
    }

    createDetailedBat() {
        const batGroup = new THREE.Group();

        // Flat wooden blade
        const bladeGeo = new THREE.BoxGeometry(0.06, 0.4, 0.02);
        const bladeMat = new THREE.MeshLambertMaterial({ color: 0xd2b48c }); // wood willow
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = 0.2;
        blade.castShadow = true;
        batGroup.add(blade);

        // Rubber grip handle
        const handleGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8);
        const handleMat = new THREE.MeshLambertMaterial({ color: 0x111111 }); // black grip
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.y = 0.49;
        batGroup.add(handle);

        return batGroup;
    }

    init3DScene() {
        if (this.threeRenderer) {
            this.resize3DCanvas();
            return;
        }

        const width = this.threeCanvasContainer.clientWidth || 500;
        const height = this.threeCanvasContainer.clientHeight || 500;

        // Scene
        this.threeScene = new THREE.Scene();
        this.threeScene.background = new THREE.Color(0x050c07); // Dark night sky
        this.threeScene.fog = new THREE.FogExp2(0x050c07, 0.015);

        // Camera
        this.threeCamera = new THREE.PerspectiveCamera(42, width / height, 0.1, 150);
        this.threeCamera.position.set(0, 3.2, 15.5);
        this.threeCamera.lookAt(0, 0.4, -4);

        // Renderer
        this.threeRenderer = new THREE.WebGLRenderer({ antialias: true });
        this.threeRenderer.setSize(width, height);
        this.threeRenderer.shadowMap.enabled = true;
        this.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.threeCanvasContainer.appendChild(this.threeRenderer.domElement);

        // OrbitControls
        this.threeControls = new THREE.OrbitControls(this.threeCamera, this.threeRenderer.domElement);
        this.threeControls.enableDamping = true;
        this.threeControls.dampingFactor = 0.05;
        this.threeControls.maxPolarAngle = Math.PI / 2 - 0.04; // Keep camera above grass
        this.threeControls.minDistance = 2.5;
        this.threeControls.maxDistance = 45;
        
        // Right Click to rotate, Left click disabled (preserves drag & drop selectors overlay)
        this.threeControls.mouseButtons = {
            LEFT: THREE.MOUSE.NONE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        };

        // Ambient Light
        const ambient = new THREE.AmbientLight(0xffffff, 0.45);
        this.threeScene.add(ambient);

        // Primary Sun/Shadow Light
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(15, 25, 15);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 80;
        dirLight.shadow.camera.left = -25;
        dirLight.shadow.camera.right = 25;
        dirLight.shadow.camera.top = 25;
        dirLight.shadow.camera.bottom = -25;
        this.threeScene.add(dirLight);

        // 1. Procedural turf texture
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#1e5225";
        ctx.fillRect(0, 0, 512, 512);
        for (let r = 512; r > 0; r -= 40) {
            ctx.fillStyle = (r % 80 === 0) ? "#1f5628" : "#17441c";
            ctx.beginPath();
            ctx.arc(256, 256, r/2, 0, Math.PI * 2);
            ctx.fill();
        }
        const turfTexture = new THREE.CanvasTexture(canvas);
        turfTexture.wrapS = THREE.RepeatWrapping;
        turfTexture.wrapT = THREE.RepeatWrapping;

        // Grass circle
        const grassGeo = new THREE.CircleGeometry(38, 32);
        const grassMat = new THREE.MeshLambertMaterial({ map: turfTexture });
        const grass = new THREE.Mesh(grassGeo, grassMat);
        grass.rotation.x = -Math.PI / 2;
        grass.receiveShadow = true;
        this.threeScene.add(grass);

        // Boundary rope white ring
        const boundaryGeo = new THREE.RingGeometry(37.7, 38.0, 64);
        const boundaryMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const boundary = new THREE.Mesh(boundaryGeo, boundaryMat);
        boundary.rotation.x = -Math.PI / 2;
        this.threeScene.add(boundary);

        // Sandy Pitch
        const pitchGeo = new THREE.BoxGeometry(2.3, 0.02, 22);
        const pitchMat = new THREE.MeshLambertMaterial({ color: 0xd6b88a });
        const pitch = new THREE.Mesh(pitchGeo, pitchMat);
        pitch.position.y = 0.01;
        pitch.receiveShadow = true;
        this.threeScene.add(pitch);

        // Crease Lines
        const creaseLineGeo = new THREE.PlaneGeometry(2.1, 0.04);
        const creaseLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        
        const creaseBat = new THREE.Mesh(creaseLineGeo, creaseLineMat);
        creaseBat.rotation.x = -Math.PI / 2;
        creaseBat.position.set(0, 0.022, 9.0);
        this.threeScene.add(creaseBat);

        const creaseBowl = new THREE.Mesh(creaseLineGeo, creaseLineMat);
        creaseBowl.rotation.x = -Math.PI / 2;
        creaseBowl.position.set(0, 0.022, -9.0);
        this.threeScene.add(creaseBowl);

        // 2. Spectator Stands & Stepped seating bowl
        this.threeStandsGroup = new THREE.Group();
        this.threeScene.add(this.threeStandsGroup);

        const standHeight = 1.0;
        const baseRadius = 38.5;
        const standCount = 5;

        for (let tier = 0; tier < standCount; tier++) {
            const innerR = baseRadius + tier * 1.8;
            const outerR = innerR + 1.8;
            const height = (tier + 1) * standHeight;

            const standGeo = new THREE.RingGeometry(innerR, outerR, 64);
            const standMat = new THREE.MeshLambertMaterial({ color: 0x22332c, side: THREE.DoubleSide });
            const stand = new THREE.Mesh(standGeo, standMat);
            stand.rotation.x = -Math.PI / 2;
            stand.position.y = height - standHeight;
            stand.receiveShadow = true;
            this.threeStandsGroup.add(stand);

            const wallGeo = new THREE.CylinderGeometry(outerR, outerR, standHeight, 64, 1, true);
            const wallMat = new THREE.MeshLambertMaterial({ color: 0x111d16, side: THREE.DoubleSide });
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.y = height - (standHeight / 2);
            this.threeStandsGroup.add(wall);

            // Audience crowd generation
            const specCount = 180 + tier * 80;
            const specGeo = new THREE.BoxGeometry(0.2, 0.35, 0.2);

            for (let s = 0; s < specCount; s++) {
                if (Math.random() < 0.25) continue;

                const angle = (s / specCount) * Math.PI * 2;
                const dist = innerR + 0.9;
                
                const x = Math.cos(angle) * dist;
                const z = Math.sin(angle) * dist;
                const y = height - standHeight + 0.175;

                const specColors = [0xd32f2f, 0x1976d2, 0x388e3c, 0xfbc02d, 0x7b1fa2, 0xe64a19, 0xffffff, 0x212121];
                const specColor = specColors[Math.floor(Math.random() * specColors.length)];
                const specMat = new THREE.MeshBasicMaterial({ color: specColor });
                
                const spectator = new THREE.Mesh(specGeo, specMat);
                spectator.position.set(x, y, z);
                spectator.lookAt(0, y, 0);

                this.threeStandsGroup.add(spectator);
            }
        }

        // Outer canopy ceiling wall
        const finalOuterR = baseRadius + standCount * 1.8;
        const outerWallGeo = new THREE.CylinderGeometry(finalOuterR + 0.5, finalOuterR + 0.5, 6, 64, 1, true);
        const outerWallMat = new THREE.MeshLambertMaterial({ color: 0x09110d, side: THREE.DoubleSide });
        const outerWall = new THREE.Mesh(outerWallGeo, outerWallMat);
        outerWall.position.y = 3;
        this.threeScene.add(outerWall);

        // 3. Floodlights (4 corners)
        const towerGeo = new THREE.CylinderGeometry(0.12, 0.28, 14, 8);
        const towerMat = new THREE.MeshLambertMaterial({ color: 0x3e4a42 });
        const bulbGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const towerCoords = [
            { x: -30, z: -30 },
            { x: 30, z: -30 },
            { x: -30, z: 30 },
            { x: 30, z: 30 }
        ];

        towerCoords.forEach(tc => {
            const tower = new THREE.Group();
            tower.position.set(tc.x, 0, tc.z);
            this.threeScene.add(tower);

            const pole = new THREE.Mesh(towerGeo, towerMat);
            pole.position.y = 7;
            pole.castShadow = true;
            tower.add(pole);

            const board = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 0.4), towerMat);
            board.position.set(0, 13.5, 0);
            board.lookAt(0, 4, 0);
            tower.add(board);

            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 4; c++) {
                    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
                    bulb.position.set(-0.75 + c * 0.5, 13.1 + r * 0.4, 0.22);
                    tower.add(bulb);
                }
            }

            const spot = new THREE.SpotLight(0xffffff, 0.35);
            spot.position.set(tc.x, 14, tc.z);
            spot.target.position.set(0, 0, 0);
            spot.angle = Math.PI / 6;
            spot.penumbra = 0.8;
            spot.castShadow = true;
            this.threeScene.add(spot);
        });

        // Wickets Group (Batting End)
        this.threeWicketsGroup = new THREE.Group();
        this.threeScene.add(this.threeWicketsGroup);

        const stumpGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.72, 8);
        const stumpMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });

        this.threeStumpMeshes = [];
        for (let i = 0; i < 3; i++) {
            const stump = new THREE.Mesh(stumpGeo, stumpMat);
            stump.position.set(-0.14 + i * 0.14, 0.36, 10);
            stump.castShadow = true;
            stump.receiveShadow = true;
            this.threeWicketsGroup.add(stump);
            this.threeStumpMeshes.push(stump);
        }

        // Bails
        const bailGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.13, 8);
        const bailMat = new THREE.MeshLambertMaterial({ color: 0xb38612 });
        this.threeBailMeshes = [];

        const bailLeft = new THREE.Mesh(bailGeo, bailMat);
        bailLeft.rotation.z = Math.PI / 2;
        bailLeft.position.set(-0.07, 0.73, 10);
        bailLeft.castShadow = true;
        this.threeWicketsGroup.add(bailLeft);
        this.threeBailMeshes.push(bailLeft);

        const bailRight = new THREE.Mesh(bailGeo, bailMat);
        bailRight.rotation.z = Math.PI / 2;
        bailRight.position.set(0.07, 0.73, 10);
        bailRight.castShadow = true;
        this.threeWicketsGroup.add(bailRight);
        this.threeBailMeshes.push(bailRight);

        // Stumps (Bowling End z=-10)
        for (let i = 0; i < 3; i++) {
            const stump = new THREE.Mesh(stumpGeo, stumpMat);
            stump.position.set(-0.14 + i * 0.14, 0.36, -10);
            stump.castShadow = true;
            this.threeScene.add(stump);
        }

        // Fielders Group
        this.threeFieldersGroup = new THREE.Group();
        this.threeScene.add(this.threeFieldersGroup);

        // Ball Mesh
        const ballGeo = new THREE.SphereGeometry(0.075, 16, 16);
        const ballMat = new THREE.MeshLambertMaterial({ color: 0x9e1b1b });
        this.threeBallMesh = new THREE.Mesh(ballGeo, ballMat);
        this.threeBallMesh.castShadow = true;
        this.threeScene.add(this.threeBallMesh);
        this.threeBallMesh.position.set(0, -5, 0); // Hide initially

        // Striker/Batsman Group
        this.threeBatsmanGroup = new THREE.Group();
        this.threeBatsmanGroup.position.set(-0.5, 0, 9.8);
        this.threeScene.add(this.threeBatsmanGroup);

        // Bowler group placeholder
        this.threeBowlerGroup = null;

        // Resize & Fullscreen event
        window.addEventListener("resize", () => this.resize3DCanvas());
        document.addEventListener("fullscreenchange", () => {
            setTimeout(() => this.resize3DCanvas(), 100);
        });

        this.resize3DCanvas();
        this.animate3DLoop();
    }

    draw3DField() {
        const state = this.getCurrentState();
        if (!state || !this.threeScene) return;

        while (this.threeFieldersGroup.children.length > 0) {
            this.threeFieldersGroup.remove(this.threeFieldersGroup.children[0]);
        }

        const batColor = state.isUserBatting ? 0x1976d2 : 0xd32f2f;
        const bowlColor = state.isUserBatting ? 0xd32f2f : 0x1976d2;

        // 1. Redraw striker (detailed humanoid holding bat)
        while (this.threeBatsmanGroup.children.length > 0) {
            this.threeBatsmanGroup.remove(this.threeBatsmanGroup.children[0]);
        }
        const batsmanBody = this.createHumanPlayer(batColor, true);
        this.threeBatsmanGroup.add(batsmanBody);

        // 2. Redraw Bowler
        if (this.threeBowlerGroup) {
            this.threeScene.remove(this.threeBowlerGroup);
        }
        this.threeBowlerGroup = this.createHumanPlayer(bowlColor, false);
        this.threeBowlerGroup.position.set(0, 0, -11);
        this.threeBowlerGroup.lookAt(0, 0, 9.8);
        this.threeScene.add(this.threeBowlerGroup);

        // 3. Redraw Keeper (behind batting end wickets)
        if (this.threeKeeperGroup) {
            this.threeScene.remove(this.threeKeeperGroup);
        }
        this.threeKeeperGroup = this.createHumanPlayer(bowlColor, false);
        this.threeKeeperGroup.position.set(0, 0, 11.2);
        this.threeKeeperGroup.lookAt(0, 0, -10);
        this.threeScene.add(this.threeKeeperGroup);

        // 4. Redraw Non-Striker
        if (this.threeNonStrikerGroup) {
            this.threeScene.remove(this.threeNonStrikerGroup);
        }
        this.threeNonStrikerGroup = this.createHumanPlayer(batColor, false);
        this.threeNonStrikerGroup.position.set(0.4, 0, -9.0); // Non-striker stands at bowling end crease
        this.threeNonStrikerGroup.lookAt(0, 0, 10); // Looking back towards striker
        this.threeScene.add(this.threeNonStrikerGroup);

        // 5. Draw 9 fielders
        const activeFielders = state.fielderPositions.filter(f => !f.isFixed);
        activeFielders.forEach(f => {
            const x3d = (f.x - 300) / 10;
            const z3d = (f.y - 300) / 10;

            const fGroup = this.createHumanPlayer(bowlColor, false);
            fGroup.position.set(x3d, 0, z3d);
            fGroup.lookAt(0, 0, 9.8); // Face batsman

            this.threeFieldersGroup.add(fGroup);
        });

        this.reset3DStumps();
        this.update3DHUD();
    }

    reset3DStumps() {
        if (!this.threeStumpMeshes || !this.threeBailMeshes) return;
        
        this.threeStumpMeshes.forEach((stump, i) => {
            stump.position.set(-0.14 + i * 0.14, 0.36, 10);
            stump.rotation.set(0, 0, 0);
        });

        this.threeBailMeshes[0].position.set(-0.07, 0.73, 10);
        this.threeBailMeshes[0].rotation.set(0, 0, Math.PI / 2);
        
        this.threeBailMeshes[1].position.set(0.07, 0.73, 10);
        this.threeBailMeshes[1].rotation.set(0, 0, Math.PI / 2);
    }

    animate3DLoop() {
        if (!this.is3DViewActive) return;

        if (this.threeControls) this.threeControls.update();
        this.threeRenderer.render(this.threeScene, this.threeCamera);
        requestAnimationFrame(() => this.animate3DLoop());
    }

    update3DHUD() {
        if (!this.is3DViewActive) return;
        const state = this.getCurrentState();
        if (!state) return;

        // 1. Team & Score
        this.threeHUDBatTeam.textContent = state.teamName.split(" ")[0];
        let scoreText = `${state.totalRuns}/${state.wickets}`;
        if (state.target) {
            scoreText += ` (Target: ${state.target})`;
        }
        this.threeHUDScoreVal.textContent = scoreText;

        // 2. Overs
        const overs = Math.floor(state.ballsBowled / 6) + "." + (state.ballsBowled % 6);
        this.threeHUDOversVal.textContent = overs;

        // 3. Batsmen names
        let batsmenHTML = "";
        if (state.striker) {
            batsmenHTML += `<span style="color: #a3e635; font-weight: 600;">${this.getInitials(state.striker.name)}*: ${state.striker.runsScored}(${state.striker.ballsFaced}) [${state.striker.mentality.toUpperCase()}]</span>`;
        }
        if (state.nonStriker) {
            batsmenHTML += `<span style="color: rgba(255,255,255,0.7); font-weight: 500;">${this.getInitials(state.nonStriker.name)}: ${state.nonStriker.runsScored}(${state.nonStriker.ballsFaced}) [${state.nonStriker.mentality.toUpperCase()}]</span>`;
        }
        this.threeHUDBatsmen.innerHTML = batsmenHTML;

        // 4. Bowler figures
        if (state.currentBowler) {
            const bOvers = Math.floor(state.currentBowler.ballsBowled / 6) + "." + (state.currentBowler.ballsBowled % 6);
            this.threeHUDBowler.innerHTML = `Bowler: <strong style="color: #fca5a5;">${this.getInitials(state.currentBowler.name)}</strong> (${state.currentBowler.runsConceded}/${state.currentBowler.wickets} in ${bOvers})`;
        } else {
            this.threeHUDBowler.textContent = "Select Bowler";
        }
    }

    show3DSelectionOverlay(type, list, callback) {
        this.threeSelectTitle.textContent = type === "BATSMAN" ? "Select Next Batsman" : "Select Next Bowler";
        
        // Populate dropdown
        this.threeSelectDropdown.innerHTML = "";
        list.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.originalIndex;
            opt.textContent = `${p.player.name} (${type === "BATSMAN" ? 'Bat: ' + p.player.batting : 'Bowl: ' + p.player.bowling})`;
            this.threeSelectDropdown.appendChild(opt);
        });

        // Show/hide batsman mentality select
        if (type === "BATSMAN") {
            this.threeSelectExtraOptions.style.display = "block";
        } else {
            this.threeSelectExtraOptions.style.display = "none";
        }

        this.threeSelectionOverlay.classList.remove("hidden");

        this.btnThreeSelectSubmit.onclick = () => {
            const selectedVal = parseInt(this.threeSelectDropdown.value);
            const mentality = this.threeSelectMentality.value;
            this.threeSelectionOverlay.classList.add("hidden");
            callback(selectedVal, mentality);
        };
    }

    animate3DBall(targetX, targetY, type, callback) {
        if (!this.threeScene) {
            callback();
            return;
        }

        this.reset3DStumps();

        const targetX_3d = (targetX - 300) / 10;
        const targetZ_3d = (targetY - 300) / 10;

        const ball = this.threeBallMesh;
        ball.position.set(0, 1.8, -10);

        let startTime = performance.now();
        const deliveryDuration = 400;

        // Reset bat rotation
        this.threeBatsmanGroup.rotation.set(0, 0, 0);

        // Classify batsman response type from pre-selected commentary
        const msg = (this.preSelectedCommentaryMsg || "").toLowerCase();
        let shotType = "ATTACK"; // default
        if (msg.includes("leave") || msg.includes("alone") || msg.includes("watchful")) {
            shotType = "LEAVE";
        } else if (msg.includes("miss") || msg.includes("beaten") || msg.includes("play and a miss")) {
            shotType = "PLAY_AND_MISS";
        } else if (msg.includes("defend") || msg.includes("defence") || msg.includes("block")) {
            shotType = "DEFENSIVE";
        }

        const animateBallDelivery = (now) => {
            const elapsed = now - startTime;
            if (elapsed < deliveryDuration) {
                const progress = elapsed / deliveryDuration;
                
                const z = -10 + 20 * progress;
                let y = 1.8;
                if (progress < 0.65) {
                    const progNorm = progress / 0.65;
                    const h = Math.sin(progNorm * Math.PI) * 0.8;
                    y = 1.8 + (0.08 - 1.8) * progNorm + h;
                } else {
                    const progNorm = (progress - 0.65) / 0.35;
                    const h = Math.sin(progNorm * Math.PI) * 0.6;
                    y = 0.08 + (0.6 - 0.08) * progNorm + h;
                }

                ball.position.set(0, y, z);
                requestAnimationFrame(animateBallDelivery);
            } else {
                ball.position.set(0, 0.6, 9.8);
                this.animate3DBatSwing(shotType);

                setTimeout(() => {
                    startTime = performance.now();
                    this.animate3DHitOutcome(targetX_3d, targetZ_3d, type, shotType, callback);
                }, 100);
            }
        };

        requestAnimationFrame(animateBallDelivery);
    }

    animate3DBatSwing(shotType) {
        let startTime = performance.now();
        const duration = 250;
        
        const swing = (now) => {
            const elapsed = now - startTime;
            if (elapsed < duration) {
                const progress = elapsed / duration;
                if (shotType === "LEAVE") {
                    // Lift bat high and away
                    this.threeBatsmanGroup.rotation.y = Math.sin(progress * Math.PI) * Math.PI / 4;
                    this.threeBatsmanGroup.rotation.x = -Math.sin(progress * Math.PI) * 0.15;
                } else if (shotType === "DEFENSIVE") {
                    // Gentle forward block
                    this.threeBatsmanGroup.rotation.x = Math.sin(progress * Math.PI) * 0.18;
                    this.threeBatsmanGroup.rotation.y = -Math.sin(progress * Math.PI) * 0.08;
                } else {
                    // Full drive swing
                    this.threeBatsmanGroup.rotation.y = -Math.sin(progress * Math.PI) * Math.PI / 2.5;
                    this.threeBatsmanGroup.rotation.x = Math.sin(progress * Math.PI) * 0.22;
                }
                requestAnimationFrame(swing);
            } else {
                this.threeBatsmanGroup.rotation.set(0, 0, 0);
            }
        };
        requestAnimationFrame(swing);
    }

    animate3DHitOutcome(targetX, targetZ, type, shotType, callback) {
        const ball = this.threeBallMesh;
        const startTime = performance.now();
        const duration = 650;

        // 1. Check leave or play and a miss: Ball goes to Wicketkeeper
        if (shotType === "LEAVE" || shotType === "PLAY_AND_MISS") {
            const leaveAnim = (now) => {
                const elapsed = now - startTime;
                if (elapsed < 200) {
                    const progress = elapsed / 200;
                    ball.position.set(0, 0.6 + (0.8 - 0.6) * progress, 9.8 + (11.2 - 9.8) * progress);
                    requestAnimationFrame(leaveAnim);
                } else {
                    setTimeout(() => {
                        ball.position.set(0, -5, 0);
                        this.triggerFlashEffects(type);
                        callback();
                    }, 400);
                }
            };
            requestAnimationFrame(leaveAnim);
            return;
        }

        // 2. Check defensive block: Ball drops onto pitch and stops
        if (shotType === "DEFENSIVE") {
            const defAnim = (now) => {
                const elapsed = now - startTime;
                if (elapsed < 250) {
                    const progress = elapsed / 250;
                    ball.position.set(0, 0.6 + (0.08 - 0.6) * progress, 9.8 + (9.2 - 9.8) * progress);
                    requestAnimationFrame(defAnim);
                } else {
                    setTimeout(() => {
                        ball.position.set(0, -5, 0);
                        this.triggerFlashEffects(type);
                        callback();
                    }, 400);
                }
            };
            requestAnimationFrame(defAnim);
            return;
        }

        // 3. Wicket Outcomes
        if (type === "W") {
            if (this.preSelectedWicketType === "BOWLED") {
                const bowledAnim = (now) => {
                    const elapsed = now - startTime;
                    if (elapsed < 200) {
                        const progress = elapsed / 200;
                        ball.position.set(0, 0.45, 9.8 + 0.2 * progress);
                        requestAnimationFrame(bowledAnim);
                    } else {
                        this.triggerFlyingStumps();
                        setTimeout(() => {
                            ball.position.set(0, -5, 0);
                            this.triggerFlashEffects(type);
                            callback();
                        }, 500);
                    }
                };
                requestAnimationFrame(bowledAnim);
            } else if (this.preSelectedWicketType === "LBW") {
                const lbwAnim = (now) => {
                    const elapsed = now - startTime;
                    if (elapsed < 150) {
                        const progress = elapsed / 150;
                        ball.position.set(-0.05 * progress, 0.4, 9.8);
                        requestAnimationFrame(lbwAnim);
                    } else {
                        // Create a red impact marker
                        const markerGeo = new THREE.SphereGeometry(0.06, 8, 8);
                        const markerMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                        const marker = new THREE.Mesh(markerGeo, markerMat);
                        marker.position.copy(ball.position);
                        this.threeScene.add(marker);
                        
                        setTimeout(() => {
                            this.threeScene.remove(marker);
                            ball.position.set(0, -5, 0);
                            this.triggerFlashEffects(type);
                            callback();
                        }, 700);
                    }
                };
                requestAnimationFrame(lbwAnim);
            } else {
                // Catch Wicket: Fielder runs to catch point
                let nearestFielder = null;
                let minDist = 999;
                this.threeFieldersGroup.children.forEach(f => {
                    const d = Math.sqrt((f.position.x - targetX)**2 + (f.position.z - targetZ)**2);
                    if (d < minDist) {
                        minDist = d;
                        nearestFielder = f;
                    }
                });
                const fStartPos = nearestFielder ? nearestFielder.position.clone() : null;

                const catchAnim = (now) => {
                    const elapsed = now - startTime;
                    if (elapsed < duration) {
                        const progress = elapsed / duration;
                        const x = targetX * progress;
                        const z = 9.8 + (targetZ - 9.8) * progress;
                        const y = 0.5 + Math.sin(progress * Math.PI) * 6;
                        ball.position.set(x, y, z);

                        if (nearestFielder && fStartPos) {
                            nearestFielder.position.set(
                                fStartPos.x + (targetX - fStartPos.x) * progress,
                                0,
                                fStartPos.z + (targetZ - fStartPos.z) * progress
                            );
                        }

                        requestAnimationFrame(catchAnim);
                    } else {
                        setTimeout(() => {
                            ball.position.set(0, -5, 0);
                            this.triggerFlashEffects(type);
                            callback();
                        }, 500);
                    }
                };
                requestAnimationFrame(catchAnim);
            }
        } else {
            // Runs (parabolic for six, bounding rolls for others)
            const isSix = type === "SIX";
            const hitAnim = (now) => {
                const elapsed = now - startTime;
                if (elapsed < duration) {
                    const progress = elapsed / duration;
                    const x = targetX * progress;
                    const z = 9.8 + (targetZ - 9.8) * progress;
                    
                    let y = 0.5;
                    if (isSix) {
                        y = 0.5 + Math.sin(progress * Math.PI) * 4.5;
                    } else {
                        y = 0.08 + Math.abs(Math.sin(progress * Math.PI * 4) * 0.15 * (1 - progress));
                    }
                    
                    ball.position.set(x, y, z);
                    requestAnimationFrame(hitAnim);
                } else {
                    ball.position.set(0, -5, 0);
                    this.triggerFlashEffects(type);
                    callback();
                }
            };
            requestAnimationFrame(hitAnim);
        }
    }

    triggerFlyingStumps() {
        this.threeStumpMeshes.forEach((stump) => {
            stump.rotation.x = Math.PI / 5 + Math.random() * 0.1;
            stump.position.z += 0.15;
        });

        let startTime = performance.now();
        const duration = 600;
        
        const leftBail = this.threeBailMeshes[0];
        const rightBail = this.threeBailMeshes[1];

        const animateBails = (now) => {
            const elapsed = now - startTime;
            if (elapsed < duration) {
                const progress = elapsed / duration;
                const yOffset = Math.sin(progress * Math.PI) * 0.8;
                const zOffset = progress * 1.5;

                leftBail.position.set(-0.07 - progress * 0.5, 0.73 + yOffset, 10 + zOffset);
                leftBail.rotation.x = progress * Math.PI * 4;
                leftBail.rotation.y = progress * Math.PI * 2;

                rightBail.position.set(0.07 + progress * 0.5, 0.73 + yOffset, 10 + zOffset);
                rightBail.rotation.x = progress * Math.PI * 4;
                rightBail.rotation.z = progress * Math.PI * 2;

                requestAnimationFrame(animateBails);
            }
        };
        requestAnimationFrame(animateBails);
    }
}

// Initialise App on Load
window.addEventListener("DOMContentLoaded", () => {
    window.game = new MatchManager();
});
