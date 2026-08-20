/* =========================================================
   CRICKET SIM PRO: DOMESTIC TEAMS, ATTRIBUTES & LEAGUE SYSTEM
   ========================================================= */

class Player {
    constructor(config) {
        this.name = config.name;
        this.role = config.role || "BATSMAN"; // "BATSMAN", "BOWLER", "ALL_ROUNDER", "WICKET_KEEPER"
        this.battingStyle = config.battingStyle || "RIGHT_HAND"; // "RIGHT_HAND", "LEFT_HAND"
        this.bowlingStyle = config.bowlingStyle || "NONE"; // "RIGHT_ARM_FAST", "LEFT_ARM_FAST", "RIGHT_ARM_MEDIUM", "OFF_SPIN", "LEG_SPIN", "LEFT_ARM_ORTHODOX", "NONE"
        this.isWicketkeeper = config.isWicketkeeper || false;

        // Batting Attributes (1-100)
        this.battingRating = config.battingRating || 70;
        this.spinSkill = config.spinSkill || 70;
        this.paceSkill = config.paceSkill || 70;
        this.aggression = config.aggression || 65; // 1-100 attacking intent
        this.preferredSectors = config.preferredSectors || [0, 6]; // Preferred shot sectors
        this.weakSectors = config.weakSectors || [3, 7]; // Weak shot sectors

        // Bowling Attributes (1-100)
        this.bowlingRating = config.bowlingRating || 50;
        this.control = config.control || 70; // Line & length control
        this.speed = config.speed || 70;     // Pace or turn rate
        this.variation = config.variation || 60; // Cutters, yorkers, doosras

        // Legacy compatibility getters/setters:
        this.batting = this.battingRating;
        this.bowling = this.bowlingRating;

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

// =========================================================
// 8 INDIAN DOMESTIC TEAMS (15 PLAYERS EACH)
// =========================================================

const DOMESTIC_TEAMS = {
    "Banswara": {
        id: "Banswara",
        name: "Banswara Warriors",
        shortName: "BAN",
        homeGround: "Banswara Stadium",
        color: "#fbbf24",
        isUserSelectable: true,
        roster: [
            new Player({ name: "Daksh Dosi", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 78, spinSkill: 75, paceSkill: 82, aggression: 72, preferredSectors: [0, 6], weakSectors: [3, 7], bowlingRating: 87, control: 88, speed: 85, variation: 80 }),
            new Player({ name: "Shatam Rai", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "LEG_SPIN", battingRating: 84, spinSkill: 86, paceSkill: 82, aggression: 80, preferredSectors: [1, 6], weakSectors: [4], bowlingRating: 30, control: 60, speed: 65, variation: 50 }),
            new Player({ name: "Akash Sinha", role: "WICKET_KEEPER", battingStyle: "LEFT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 77, spinSkill: 80, paceSkill: 74, aggression: 68, preferredSectors: [2, 5], weakSectors: [0], bowlingRating: 15, control: 40, speed: 30, variation: 20 }),
            new Player({ name: "Pranath V", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 72, spinSkill: 70, paceSkill: 74, aggression: 60, preferredSectors: [6, 7], weakSectors: [2], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Vinod Prajapati", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 45, spinSkill: 40, paceSkill: 50, aggression: 75, preferredSectors: [0], weakSectors: [5], bowlingRating: 88, control: 86, speed: 90, variation: 84 }),
            new Player({ name: "Krishiv", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 79, spinSkill: 82, paceSkill: 76, aggression: 75, preferredSectors: [5, 6], weakSectors: [1], bowlingRating: 40, control: 65, speed: 60, variation: 55 }),
            new Player({ name: "Kushagra", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "LEFT_ARM_FAST", battingRating: 35, spinSkill: 30, paceSkill: 40, aggression: 60, preferredSectors: [0], weakSectors: [6], bowlingRating: 85, control: 82, speed: 88, variation: 80 }),
            new Player({ name: "Ratna Deep", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 85, spinSkill: 84, paceSkill: 86, aggression: 82, preferredSectors: [0, 1, 6], weakSectors: [3], bowlingRating: 79, control: 80, speed: 78, variation: 75 }),
            new Player({ name: "Rohit Yadav", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 25, spinSkill: 20, paceSkill: 30, aggression: 40, preferredSectors: [0], weakSectors: [4], bowlingRating: 82, control: 85, speed: 72, variation: 86 }),
            new Player({ name: "Krishna Dubey", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 38, spinSkill: 30, paceSkill: 45, aggression: 65, preferredSectors: [0], weakSectors: [6], bowlingRating: 87, control: 84, speed: 89, variation: 82 }),
            new Player({ name: "Teena Naruka", role: "ALL_ROUNDER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_ORTHODOX", battingRating: 89, spinSkill: 92, paceSkill: 86, aggression: 88, preferredSectors: [4, 5, 6], weakSectors: [1], bowlingRating: 72, control: 75, speed: 70, variation: 74 }),
            new Player({ name: "Aarav Joshi", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 70, spinSkill: 72, paceSkill: 68, aggression: 62, preferredSectors: [6], weakSectors: [2], bowlingRating: 15, control: 35, speed: 40, variation: 30 }),
            new Player({ name: "Vivan Mehta", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 30, spinSkill: 25, paceSkill: 35, aggression: 50, preferredSectors: [0], weakSectors: [7], bowlingRating: 80, control: 78, speed: 84, variation: 76 }),
            new Player({ name: "Yash Verma", role: "WICKET_KEEPER", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 73, spinSkill: 70, paceSkill: 76, aggression: 70, preferredSectors: [1, 2], weakSectors: [5], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Manan Sharma", role: "ALL_ROUNDER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_ORTHODOX", battingRating: 74, spinSkill: 76, paceSkill: 72, aggression: 66, preferredSectors: [5], weakSectors: [0], bowlingRating: 75, control: 76, speed: 70, variation: 72 })
        ]
    },

    "Chennai": {
        id: "Chennai",
        name: "Chennai Warriors",
        shortName: "CHE",
        homeGround: "MA Chidambaram Stadium",
        color: "#facc15",
        isUserSelectable: false,
        roster: [
            new Player({ name: "Ashwin Kumar", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 75, spinSkill: 80, paceSkill: 70, aggression: 65, preferredSectors: [0, 6], weakSectors: [2], bowlingRating: 89, control: 92, speed: 75, variation: 90 }),
            new Player({ name: "Dinesh Karthik", role: "WICKET_KEEPER", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 83, spinSkill: 85, paceSkill: 81, aggression: 85, preferredSectors: [2, 3, 6], weakSectors: [7], bowlingRating: 15, control: 40, speed: 30, variation: 20 }),
            new Player({ name: "Vijay Shankar", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 76, spinSkill: 74, paceSkill: 78, aggression: 70, preferredSectors: [6, 7], weakSectors: [1], bowlingRating: 74, control: 75, speed: 76, variation: 72 }),
            new Player({ name: "Karthik Raj", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 82, spinSkill: 86, paceSkill: 78, aggression: 76, preferredSectors: [5, 6], weakSectors: [3], bowlingRating: 20, control: 40, speed: 40, variation: 30 }),
            new Player({ name: "Washington S", role: "ALL_ROUNDER", battingStyle: "LEFT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 74, spinSkill: 78, paceSkill: 70, aggression: 60, preferredSectors: [4, 5], weakSectors: [0], bowlingRating: 81, control: 84, speed: 74, variation: 80 }),
            new Player({ name: "Natarajan T", role: "BOWLER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_FAST", battingRating: 30, spinSkill: 25, paceSkill: 35, aggression: 50, preferredSectors: [0], weakSectors: [6], bowlingRating: 86, control: 88, speed: 85, variation: 89 }),
            new Player({ name: "Sai Kishore", role: "BOWLER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_ORTHODOX", battingRating: 48, spinSkill: 50, paceSkill: 46, aggression: 55, preferredSectors: [5], weakSectors: [1], bowlingRating: 83, control: 85, speed: 73, variation: 80 }),
            new Player({ name: "Subramanian V", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 78, spinSkill: 82, paceSkill: 74, aggression: 68, preferredSectors: [1, 6], weakSectors: [4], bowlingRating: 15, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Jagadeesan N", role: "WICKET_KEEPER", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 72, spinSkill: 74, paceSkill: 70, aggression: 65, preferredSectors: [6, 7], weakSectors: [2], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Balaji S", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 32, spinSkill: 30, paceSkill: 34, aggression: 45, preferredSectors: [0], weakSectors: [5], bowlingRating: 80, control: 82, speed: 78, variation: 77 }),
            new Player({ name: "Murugan Ashwin", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "LEG_SPIN", battingRating: 35, spinSkill: 30, paceSkill: 40, aggression: 50, preferredSectors: [0], weakSectors: [6], bowlingRating: 79, control: 76, speed: 76, variation: 82 }),
            new Player({ name: "Hari Nishanth", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "NONE", battingRating: 71, spinSkill: 73, paceSkill: 69, aggression: 72, preferredSectors: [4, 5], weakSectors: [1], bowlingRating: 15, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Sundar R", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 69, spinSkill: 72, paceSkill: 66, aggression: 60, preferredSectors: [6], weakSectors: [3], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Anirudh P", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 28, spinSkill: 25, paceSkill: 31, aggression: 40, preferredSectors: [0], weakSectors: [7], bowlingRating: 78, control: 77, speed: 83, variation: 74 }),
            new Player({ name: "Guruswamy R", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 68, spinSkill: 70, paceSkill: 66, aggression: 62, preferredSectors: [1, 6], weakSectors: [4], bowlingRating: 72, control: 74, speed: 70, variation: 70 })
        ]
    },

    "Mumbai": {
        id: "Mumbai",
        name: "Mumbai Strikers",
        shortName: "MUM",
        homeGround: "Wankhede Stadium",
        color: "#3b82f6",
        isUserSelectable: false,
        roster: [
            new Player({ name: "Suryakumar More", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 91, spinSkill: 92, paceSkill: 90, aggression: 90, preferredSectors: [2, 3, 5, 6], weakSectors: [0], bowlingRating: 20, control: 40, speed: 40, variation: 30 }),
            new Player({ name: "Shreyas Deshmukh", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "LEG_SPIN", battingRating: 84, spinSkill: 86, paceSkill: 82, aggression: 76, preferredSectors: [0, 1, 6], weakSectors: [7], bowlingRating: 45, control: 60, speed: 65, variation: 55 }),
            new Player({ name: "Shardul Gawde", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 74, spinSkill: 70, paceSkill: 78, aggression: 82, preferredSectors: [0, 1], weakSectors: [6], bowlingRating: 83, control: 80, speed: 84, variation: 85 }),
            new Player({ name: "Aditya Tare", role: "WICKET_KEEPER", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 76, spinSkill: 78, paceSkill: 74, aggression: 70, preferredSectors: [6, 7], weakSectors: [3], bowlingRating: 15, control: 40, speed: 30, variation: 20 }),
            new Player({ name: "Tushar Deshpande", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 32, spinSkill: 28, paceSkill: 36, aggression: 60, preferredSectors: [0], weakSectors: [5], bowlingRating: 84, control: 81, speed: 88, variation: 82 }),
            new Player({ name: "Shams Mulani", role: "ALL_ROUNDER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_ORTHODOX", battingRating: 72, spinSkill: 75, paceSkill: 69, aggression: 64, preferredSectors: [4, 5], weakSectors: [1], bowlingRating: 81, control: 83, speed: 72, variation: 78 }),
            new Player({ name: "Dhawal Kulkarni", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 36, spinSkill: 32, paceSkill: 40, aggression: 50, preferredSectors: [0], weakSectors: [6], bowlingRating: 81, control: 86, speed: 78, variation: 80 }),
            new Player({ name: "Omkar Kulkarni", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "NONE", battingRating: 77, spinSkill: 80, paceSkill: 74, aggression: 72, preferredSectors: [4, 5, 6], weakSectors: [2], bowlingRating: 15, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Prathamesh Shinde", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 75, spinSkill: 76, paceSkill: 74, aggression: 68, preferredSectors: [6, 7], weakSectors: [3], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Tanush Kotian", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 71, spinSkill: 73, paceSkill: 69, aggression: 62, preferredSectors: [1, 6], weakSectors: [4], bowlingRating: 78, control: 80, speed: 72, variation: 75 }),
            new Player({ name: "Siddhesh Lad", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 73, spinSkill: 75, paceSkill: 71, aggression: 65, preferredSectors: [0, 6], weakSectors: [2], bowlingRating: 40, control: 60, speed: 60, variation: 50 }),
            new Player({ name: "Rohit Patil", role: "WICKET_KEEPER", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 70, spinSkill: 72, paceSkill: 68, aggression: 66, preferredSectors: [6], weakSectors: [5], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Jay Bista", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 72, spinSkill: 74, paceSkill: 70, aggression: 70, preferredSectors: [6, 7], weakSectors: [1], bowlingRating: 35, control: 55, speed: 60, variation: 45 }),
            new Player({ name: "Shivam Mahajan", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 28, spinSkill: 25, paceSkill: 31, aggression: 45, preferredSectors: [0], weakSectors: [6], bowlingRating: 77, control: 76, speed: 85, variation: 75 }),
            new Player({ name: "Hardik Paranjape", role: "BOWLER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_FAST", battingRating: 25, spinSkill: 22, paceSkill: 28, aggression: 40, preferredSectors: [0], weakSectors: [7], bowlingRating: 76, control: 75, speed: 83, variation: 74 })
        ]
    },

    "Bengaluru": {
        id: "Bengaluru",
        name: "Bengaluru Royals",
        shortName: "BLR",
        homeGround: "M Chinnaswamy Stadium",
        color: "#ef4444",
        isUserSelectable: false,
        roster: [
            new Player({ name: "Mayank Agarwal", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 85, spinSkill: 86, paceSkill: 84, aggression: 82, preferredSectors: [0, 6, 7], weakSectors: [3], bowlingRating: 15, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Devdutt Gowda", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "NONE", battingRating: 81, spinSkill: 82, paceSkill: 80, aggression: 74, preferredSectors: [4, 5, 6], weakSectors: [1], bowlingRating: 15, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Karun Nair", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 80, spinSkill: 82, paceSkill: 78, aggression: 70, preferredSectors: [1, 2, 6], weakSectors: [5], bowlingRating: 35, control: 55, speed: 60, variation: 45 }),
            new Player({ name: "Sharath BR", role: "WICKET_KEEPER", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 73, spinSkill: 74, paceSkill: 72, aggression: 75, preferredSectors: [2, 6], weakSectors: [7], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Krishnappa Gowda", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 74, spinSkill: 72, paceSkill: 76, aggression: 84, preferredSectors: [0, 1], weakSectors: [4], bowlingRating: 80, control: 82, speed: 74, variation: 81 }),
            new Player({ name: "Shreyas Gopal", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "LEG_SPIN", battingRating: 72, spinSkill: 74, paceSkill: 70, aggression: 65, preferredSectors: [1, 6], weakSectors: [3], bowlingRating: 81, control: 82, speed: 76, variation: 84 }),
            new Player({ name: "Prasidh Murthy", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 30, spinSkill: 25, paceSkill: 35, aggression: 50, preferredSectors: [0], weakSectors: [6], bowlingRating: 86, control: 83, speed: 90, variation: 82 }),
            new Player({ name: "Vyshak Vijaykumar", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 35, spinSkill: 30, paceSkill: 40, aggression: 60, preferredSectors: [0], weakSectors: [5], bowlingRating: 82, control: 81, speed: 86, variation: 83 }),
            new Player({ name: "Abhinav Manohar", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 77, spinSkill: 76, paceSkill: 78, aggression: 86, preferredSectors: [0, 1, 6], weakSectors: [4], bowlingRating: 15, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Varun Rao", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 74, spinSkill: 76, paceSkill: 72, aggression: 68, preferredSectors: [6, 7], weakSectors: [2], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Manish Hegde", role: "WICKET_KEEPER", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 71, spinSkill: 73, paceSkill: 69, aggression: 64, preferredSectors: [6], weakSectors: [3], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Nikin Jose", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 73, spinSkill: 75, paceSkill: 71, aggression: 62, preferredSectors: [6, 7], weakSectors: [1], bowlingRating: 30, control: 50, speed: 55, variation: 40 }),
            new Player({ name: "Cariappa KC", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "LEG_SPIN", battingRating: 32, spinSkill: 28, paceSkill: 36, aggression: 45, preferredSectors: [0], weakSectors: [6], bowlingRating: 79, control: 78, speed: 75, variation: 82 }),
            new Player({ name: "Suchith J", role: "ALL_ROUNDER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_ORTHODOX", battingRating: 69, spinSkill: 72, paceSkill: 66, aggression: 65, preferredSectors: [4, 5], weakSectors: [0], bowlingRating: 77, control: 80, speed: 72, variation: 76 }),
            new Player({ name: "Chethan L", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 70, spinSkill: 72, paceSkill: 68, aggression: 70, preferredSectors: [6], weakSectors: [3], bowlingRating: 10, control: 30, speed: 30, variation: 20 })
        ]
    },

    "Delhi": {
        id: "Delhi",
        name: "Delhi Strikers",
        shortName: "DEL",
        homeGround: "Arun Jaitley Stadium",
        color: "#6366f1",
        isUserSelectable: false,
        roster: [
            new Player({ name: "Yash Dhull", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 81, spinSkill: 83, paceSkill: 79, aggression: 74, preferredSectors: [0, 6], weakSectors: [3], bowlingRating: 35, control: 55, speed: 60, variation: 45 }),
            new Player({ name: "Ayush Badoni", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 80, spinSkill: 82, paceSkill: 78, aggression: 84, preferredSectors: [1, 2, 6], weakSectors: [7], bowlingRating: 65, control: 70, speed: 68, variation: 66 }),
            new Player({ name: "Anuj Rawat", role: "WICKET_KEEPER", battingStyle: "LEFT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 77, spinSkill: 79, paceSkill: 75, aggression: 78, preferredSectors: [4, 5, 6], weakSectors: [1], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Navdeep Saini", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 32, spinSkill: 28, paceSkill: 36, aggression: 50, preferredSectors: [0], weakSectors: [6], bowlingRating: 84, control: 80, speed: 92, variation: 80 }),
            new Player({ name: "Mayank Yadav", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 28, spinSkill: 24, paceSkill: 32, aggression: 45, preferredSectors: [0], weakSectors: [5], bowlingRating: 86, control: 82, speed: 94, variation: 81 }),
            new Player({ name: "Lalit Yadav", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 74, spinSkill: 76, paceSkill: 72, aggression: 70, preferredSectors: [1, 6], weakSectors: [4], bowlingRating: 78, control: 80, speed: 72, variation: 76 }),
            new Player({ name: "Harshit Rana", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 48, spinSkill: 44, paceSkill: 52, aggression: 75, preferredSectors: [0, 1], weakSectors: [6], bowlingRating: 83, control: 81, speed: 88, variation: 84 }),
            new Player({ name: "Priyansh Arya", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "NONE", battingRating: 76, spinSkill: 78, paceSkill: 74, aggression: 82, preferredSectors: [4, 5], weakSectors: [2], bowlingRating: 15, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Hrithik Shokeen", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 70, spinSkill: 72, paceSkill: 68, aggression: 66, preferredSectors: [6], weakSectors: [3], bowlingRating: 77, control: 79, speed: 73, variation: 75 }),
            new Player({ name: "Simarjeet Singh", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 30, spinSkill: 26, paceSkill: 34, aggression: 45, preferredSectors: [0], weakSectors: [7], bowlingRating: 80, control: 78, speed: 86, variation: 78 }),
            new Player({ name: "Himmat Singh", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 74, spinSkill: 76, paceSkill: 72, aggression: 68, preferredSectors: [6, 7], weakSectors: [1], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Suyash Sharma", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "LEG_SPIN", battingRating: 25, spinSkill: 20, paceSkill: 30, aggression: 40, preferredSectors: [0], weakSectors: [6], bowlingRating: 81, control: 78, speed: 76, variation: 85 }),
            new Player({ name: "Tejas Baroka", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "LEG_SPIN", battingRating: 24, spinSkill: 20, paceSkill: 28, aggression: 35, preferredSectors: [0], weakSectors: [5], bowlingRating: 76, control: 75, speed: 73, variation: 78 }),
            new Player({ name: "Vaibhav Kandpal", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 71, spinSkill: 73, paceSkill: 69, aggression: 65, preferredSectors: [6], weakSectors: [3], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Kshitiz Sharma", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "NONE", battingRating: 69, spinSkill: 71, paceSkill: 67, aggression: 60, preferredSectors: [5], weakSectors: [0], bowlingRating: 10, control: 30, speed: 30, variation: 20 })
        ]
    },

    "Kolkata": {
        id: "Kolkata",
        name: "Kolkata Knights",
        shortName: "KOL",
        homeGround: "Eden Gardens",
        color: "#a855f7",
        isUserSelectable: false,
        roster: [
            new Player({ name: "Abishek Porel", role: "WICKET_KEEPER", battingStyle: "LEFT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 80, spinSkill: 82, paceSkill: 78, aggression: 80, preferredSectors: [4, 5, 6], weakSectors: [1], bowlingRating: 15, control: 40, speed: 30, variation: 20 }),
            new Player({ name: "Abhimanyu Easwaran", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 83, spinSkill: 84, paceSkill: 82, aggression: 62, preferredSectors: [6, 7], weakSectors: [2], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Anustup Majumdar", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "LEG_SPIN", battingRating: 81, spinSkill: 84, paceSkill: 78, aggression: 68, preferredSectors: [0, 1, 6], weakSectors: [4], bowlingRating: 40, control: 60, speed: 60, variation: 50 }),
            new Player({ name: "Shahbaz Ahmed", role: "ALL_ROUNDER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_ORTHODOX", battingRating: 76, spinSkill: 78, paceSkill: 74, aggression: 74, preferredSectors: [4, 5], weakSectors: [0], bowlingRating: 81, control: 83, speed: 73, variation: 79 }),
            new Player({ name: "Mukesh Kumar", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 32, spinSkill: 28, paceSkill: 36, aggression: 45, preferredSectors: [0], weakSectors: [6], bowlingRating: 85, control: 88, speed: 85, variation: 83 }),
            new Player({ name: "Akash Deep", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 45, spinSkill: 40, paceSkill: 50, aggression: 75, preferredSectors: [0, 1], weakSectors: [5], bowlingRating: 84, control: 83, speed: 89, variation: 80 }),
            new Player({ name: "Ishan Porel", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 28, spinSkill: 24, paceSkill: 32, aggression: 40, preferredSectors: [0], weakSectors: [7], bowlingRating: 80, control: 81, speed: 85, variation: 77 }),
            new Player({ name: "Sudip Gharami", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 75, spinSkill: 77, paceSkill: 73, aggression: 66, preferredSectors: [6, 7], weakSectors: [3], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Writtick Chatterjee", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 71, spinSkill: 73, paceSkill: 69, aggression: 62, preferredSectors: [1, 6], weakSectors: [4], bowlingRating: 75, control: 77, speed: 70, variation: 72 }),
            new Player({ name: "Karan Lal", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 70, spinSkill: 72, paceSkill: 68, aggression: 65, preferredSectors: [6], weakSectors: [2], bowlingRating: 74, control: 76, speed: 71, variation: 70 }),
            new Player({ name: "Sayan Mondal", role: "ALL_ROUNDER", battingStyle: "LEFT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 69, spinSkill: 71, paceSkill: 67, aggression: 60, preferredSectors: [5], weakSectors: [0], bowlingRating: 73, control: 75, speed: 75, variation: 70 }),
            new Player({ name: "Kanishk Seth", role: "BOWLER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_MEDIUM", battingRating: 26, spinSkill: 22, paceSkill: 30, aggression: 40, preferredSectors: [0], weakSectors: [6], bowlingRating: 76, control: 75, speed: 78, variation: 74 }),
            new Player({ name: "Kaushik Ghosh", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "NONE", battingRating: 72, spinSkill: 74, paceSkill: 70, aggression: 64, preferredSectors: [4, 5], weakSectors: [1], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Pritam Chakraborty", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 25, spinSkill: 20, paceSkill: 30, aggression: 40, preferredSectors: [0], weakSectors: [7], bowlingRating: 75, control: 76, speed: 76, variation: 72 }),
            new Player({ name: "Subham Chatterjee", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 70, spinSkill: 72, paceSkill: 68, aggression: 66, preferredSectors: [6], weakSectors: [3], bowlingRating: 10, control: 30, speed: 30, variation: 20 })
        ]
    },

    "Punjab": {
        id: "Punjab",
        name: "Punjab Lions",
        shortName: "PUN",
        homeGround: "PCA Stadium Mohali",
        color: "#f97316",
        isUserSelectable: false,
        roster: [
            new Player({ name: "Abhishek Sharma", role: "ALL_ROUNDER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_ORTHODOX", battingRating: 87, spinSkill: 88, paceSkill: 86, aggression: 90, preferredSectors: [4, 5, 6], weakSectors: [1], bowlingRating: 74, control: 76, speed: 72, variation: 75 }),
            new Player({ name: "Prabhsimran Singh", role: "WICKET_KEEPER", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 82, spinSkill: 83, paceSkill: 81, aggression: 86, preferredSectors: [0, 1, 6], weakSectors: [4], bowlingRating: 15, control: 40, speed: 30, variation: 20 }),
            new Player({ name: "Nehal Wadhera", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "LEG_SPIN", battingRating: 81, spinSkill: 83, paceSkill: 79, aggression: 82, preferredSectors: [4, 5, 6], weakSectors: [0], bowlingRating: 40, control: 55, speed: 60, variation: 50 }),
            new Player({ name: "Arshdeep Singh", role: "BOWLER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_FAST", battingRating: 35, spinSkill: 30, paceSkill: 40, aggression: 65, preferredSectors: [0], weakSectors: [6], bowlingRating: 88, control: 89, speed: 86, variation: 92 }),
            new Player({ name: "Harpreet Brar", role: "ALL_ROUNDER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_ORTHODOX", battingRating: 73, spinSkill: 75, paceSkill: 71, aggression: 72, preferredSectors: [4, 5], weakSectors: [2], bowlingRating: 82, control: 85, speed: 74, variation: 80 }),
            new Player({ name: "Naman Dhir", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 77, spinSkill: 78, paceSkill: 76, aggression: 80, preferredSectors: [1, 6], weakSectors: [3], bowlingRating: 70, control: 72, speed: 70, variation: 68 }),
            new Player({ name: "Anmolpreet Singh", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 76, spinSkill: 78, paceSkill: 74, aggression: 70, preferredSectors: [6, 7], weakSectors: [2], bowlingRating: 30, control: 50, speed: 55, variation: 40 }),
            new Player({ name: "Siddharth Kaul", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 32, spinSkill: 28, paceSkill: 36, aggression: 50, preferredSectors: [0], weakSectors: [5], bowlingRating: 81, control: 82, speed: 84, variation: 83 }),
            new Player({ name: "Mayank Markande", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "LEG_SPIN", battingRating: 30, spinSkill: 26, paceSkill: 34, aggression: 45, preferredSectors: [0], weakSectors: [7], bowlingRating: 82, control: 80, speed: 76, variation: 85 }),
            new Player({ name: "Sanvir Singh", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 74, spinSkill: 72, paceSkill: 76, aggression: 76, preferredSectors: [0, 6], weakSectors: [3], bowlingRating: 73, control: 75, speed: 76, variation: 72 }),
            new Player({ name: "Gurkeerat Mann", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 75, spinSkill: 77, paceSkill: 73, aggression: 72, preferredSectors: [1, 6], weakSectors: [4], bowlingRating: 45, control: 60, speed: 62, variation: 55 }),
            new Player({ name: "Baltej Singh", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 28, spinSkill: 24, paceSkill: 32, aggression: 40, preferredSectors: [0], weakSectors: [6], bowlingRating: 77, control: 79, speed: 78, variation: 75 }),
            new Player({ name: "Ramandeep Singh", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 75, spinSkill: 73, paceSkill: 77, aggression: 84, preferredSectors: [0, 1], weakSectors: [5], bowlingRating: 75, control: 76, speed: 79, variation: 74 }),
            new Player({ name: "Gurnoor Brar", role: "BOWLER", battingStyle: "LEFT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 26, spinSkill: 22, paceSkill: 30, aggression: 45, preferredSectors: [0], weakSectors: [7], bowlingRating: 76, control: 74, speed: 86, variation: 73 }),
            new Player({ name: "Ashwani Kumar", role: "BOWLER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_FAST", battingRating: 24, spinSkill: 20, paceSkill: 28, aggression: 40, preferredSectors: [0], weakSectors: [6], bowlingRating: 75, control: 74, speed: 84, variation: 74 })
        ]
    },

    "Hyderabad": {
        id: "Hyderabad",
        name: "Hyderabad Titans",
        shortName: "HYD",
        homeGround: "Rajiv Gandhi International Stadium",
        color: "#06b6d4",
        isUserSelectable: false,
        roster: [
            new Player({ name: "Tilak Varma", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 88, spinSkill: 89, paceSkill: 87, aggression: 82, preferredSectors: [4, 5, 6], weakSectors: [1], bowlingRating: 50, control: 65, speed: 65, variation: 55 }),
            new Player({ name: "Rahul Buddhi", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "NONE", battingRating: 76, spinSkill: 78, paceSkill: 74, aggression: 78, preferredSectors: [4, 5], weakSectors: [2], bowlingRating: 15, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Tanmay Agarwal", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "NONE", battingRating: 81, spinSkill: 82, paceSkill: 80, aggression: 75, preferredSectors: [4, 5, 6], weakSectors: [0], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "K Sumanth", role: "WICKET_KEEPER", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 73, spinSkill: 75, paceSkill: 71, aggression: 65, preferredSectors: [6, 7], weakSectors: [3], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Chama Milind", role: "BOWLER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_MEDIUM", battingRating: 40, spinSkill: 36, paceSkill: 44, aggression: 60, preferredSectors: [0], weakSectors: [6], bowlingRating: 82, control: 84, speed: 80, variation: 81 }),
            new Player({ name: "Ravi Teja", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 74, spinSkill: 72, paceSkill: 76, aggression: 72, preferredSectors: [1, 6], weakSectors: [4], bowlingRating: 79, control: 81, speed: 78, variation: 76 }),
            new Player({ name: "Tanay Thyagarajan", role: "ALL_ROUNDER", battingStyle: "LEFT_HAND", bowlingStyle: "LEFT_ARM_ORTHODOX", battingRating: 71, spinSkill: 73, paceSkill: 69, aggression: 64, preferredSectors: [5], weakSectors: [1], bowlingRating: 80, control: 82, speed: 72, variation: 78 }),
            new Player({ name: "Akshath Reddy", role: "BATSMAN", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", battingRating: 77, spinSkill: 79, paceSkill: 75, aggression: 70, preferredSectors: [6, 7], weakSectors: [3], bowlingRating: 10, control: 30, speed: 30, variation: 20 }),
            new Player({ name: "Ajay Dev Goud", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 30, spinSkill: 26, paceSkill: 34, aggression: 45, preferredSectors: [0], weakSectors: [5], bowlingRating: 78, control: 79, speed: 79, variation: 75 }),
            new Player({ name: "Rohit Rayudu", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 75, spinSkill: 77, paceSkill: 73, aggression: 68, preferredSectors: [4, 5], weakSectors: [0], bowlingRating: 40, control: 60, speed: 60, variation: 50 }),
            new Player({ name: "Mickil Jaiswal", role: "ALL_ROUNDER", battingStyle: "RIGHT_HAND", bowlingStyle: "LEG_SPIN", battingRating: 70, spinSkill: 72, paceSkill: 68, aggression: 66, preferredSectors: [6], weakSectors: [2], bowlingRating: 74, control: 75, speed: 74, variation: 76 }),
            new Player({ name: "B Sandeep", role: "BATSMAN", battingStyle: "LEFT_HAND", bowlingStyle: "OFF_SPIN", battingRating: 74, spinSkill: 76, paceSkill: 72, aggression: 62, preferredSectors: [5, 6], weakSectors: [1], bowlingRating: 35, control: 55, speed: 58, variation: 45 }),
            new Player({ name: "Rakshann Readdi", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_FAST", battingRating: 25, spinSkill: 21, paceSkill: 29, aggression: 40, preferredSectors: [0], weakSectors: [7], bowlingRating: 76, control: 75, speed: 85, variation: 73 }),
            new Player({ name: "Kartikeya Kak", role: "BOWLER", battingStyle: "RIGHT_HAND", bowlingStyle: "RIGHT_ARM_MEDIUM", battingRating: 24, spinSkill: 20, paceSkill: 28, aggression: 35, preferredSectors: [0], weakSectors: [6], bowlingRating: 75, control: 76, speed: 77, variation: 74 }),
            new Player({ name: "Prateek Reddy", role: "WICKET_KEEPER", battingStyle: "RIGHT_HAND", bowlingStyle: "NONE", isWicketkeeper: true, battingRating: 68, spinSkill: 70, paceSkill: 66, aggression: 65, preferredSectors: [6], weakSectors: [4], bowlingRating: 10, control: 30, speed: 30, variation: 20 })
        ]
    }
};

// =========================================================
// LEAGUE MANAGER & ROUND ROBIN FIXTURE GENERATOR
// =========================================================

class LeagueManager {
    constructor() {
        this.teams = Object.keys(DOMESTIC_TEAMS); // 8 Team IDs
        this.t20Fixtures = [];
        this.testFixtures = [];
        this.standings = {};

        this.initStandings();
        this.generateFixtures();
    }

    initStandings() {
        this.teams.forEach(teamId => {
            this.standings[teamId] = {
                teamId: teamId,
                name: DOMESTIC_TEAMS[teamId].name,
                shortName: DOMESTIC_TEAMS[teamId].shortName,
                played: 0,
                won: 0,
                lost: 0,
                tied: 0,
                points: 0,
                runsScored: 0,
                oversFaced: 0,
                runsConceded: 0,
                oversBowled: 0
            };
        });
    }

    generateFixtures() {
        // Round Robin algorithm for 8 teams (7 rounds, 4 matches per round = 28 matches)
        const teamList = [...this.teams];
        const numTeams = teamList.length;
        const numRounds = numTeams - 1;
        const matchesPerRound = numTeams / 2;

        let rotation = [...teamList];

        for (let round = 1; round <= numRounds; round++) {
            const roundT20Matches = [];
            const roundTestMatches = [];

            for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
                const home = rotation[matchIdx];
                const away = rotation[numTeams - 1 - matchIdx];

                roundT20Matches.push({
                    id: `T20-R${round}-M${matchIdx + 1}`,
                    round: round,
                    homeTeam: home,
                    awayTeam: away,
                    format: "T20",
                    isCompleted: false,
                    winner: null
                });

                roundTestMatches.push({
                    id: `TEST-R${round}-M${matchIdx + 1}`,
                    round: round,
                    homeTeam: home,
                    awayTeam: away,
                    format: "TEST",
                    isCompleted: false,
                    winner: null
                });
            }

            this.t20Fixtures.push({ round: round, matches: roundT20Matches });
            this.testFixtures.push({ round: round, matches: roundTestMatches });

            // Rotate array keeping index 0 fixed
            rotation = [rotation[0], rotation[numTeams - 1], ...rotation.slice(1, numTeams - 1)];
        }
    }

    getStandingsSorted() {
        return Object.values(this.standings).sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            // Tiebreak on Wins
            return b.won - a.won;
        });
    }
}

// Global League Instance
const GLOBAL_LEAGUE = new LeagueManager();
