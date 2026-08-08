import random

TOTAL_OVERS = 20


# --------------------------
# Player Class
# --------------------------

class Player:
    def __init__(self, name, batting, bowling):
        self.name = name
        self.batting = batting
        self.bowling = bowling
        self.reset_stats()

    def reset_stats(self):
        self.overs_bowled = 0
        self.runs_conceded = 0
        self.wickets = 0

        self.runs_scored = 0
        self.balls_faced = 0
        self.is_out = False
        self.has_batted = False


# --------------------------
# Teams
# --------------------------

our_team = [
    Player("Daksh Dosi", 75, 87),
    Player("Shatam Rai", 80, 20),
    Player("Akash Sinha", 75, 65),
    Player("Pranath V", 60, 10),
    Player("Vinod Prajapati", 45, 86),
    Player("Krishiv", 76, 25),
    Player("Kushagra", 31, 81),
    Player("Ratna Deep", 85, 79),
    Player("Rohit Yadav", 15, 77),
    Player("Krishna Dubey", 35, 87),
    Player("Teena Naruka", 89, 69),
]

opponent_team = [
    Player("Vandan", 84, 46),
    Player("Atharva Bhavesh", 72, 65),
    Player("Paradox", 88, 39),
    Player("Anto", 61, 78),
    Player("Soumyajyoti Dey", 75, 52),
    Player("Vaibhav Nagpal", 69, 81),
    Player("Sai Siddhant", 83, 57),
    Player("Arpita Ghosh", 66, 74),
    Player("Dean M", 58, 85),
    Player("Vecna", 77, 63),
    Player("Pushkal Gupta", 54, 88),
]


# --------------------------
# Commentary
# --------------------------

commentary = {
    "DOT": ["Solid defence.", "Beaten outside off!", "No run there."],
    "1": ["Tucked for a single.", "Keeps strike rotating."],
    "2": ["Back for two!", "Easy double."],
    "3": ["Brilliant running!"],
    "4": ["Races away!", "Cracking cover drive!"],
    "6": ["That's massive!", "Into the stands!"],
    "W": ["He's gone! Big breakthrough!", "Clean bowled!"]
}


# --------------------------
# Reset
# --------------------------
1
def reset_all_players():
    for p in our_team + opponent_team:
        p.reset_stats()


# --------------------------
# Toss
# --------------------------

def toss():
    call = input("Heads or Tails? ").lower()
    result = random.choice(["heads", "tails"])
    print("Coin landed on:", result.upper())

    if call == result:
        choice = input("You won the toss! Bat or Bowl? ").lower()
        return choice == "bat"
    else:
        opp_choice = random.choice(["bat", "bowl"])
        print("Opponent won the toss and chooses to", opp_choice)
        return opp_choice == "bowl"


# --------------------------
# Probability Engine
# --------------------------

def get_probs(over, batsman, bowler, free_hit):
    diff = batsman.batting - bowler.bowling

    probs = {
        "DOT": 28,
        "1": 28,
        "2": 14,
        "3": 4,
        "4": 10,
        "6": 6,
        "W": 8,
        "WIDE": 1,
        "NO BALL": 1
    }

    if over <= 6:
        probs["4"] += 5

    if over >= 16:
        probs["4"] += 10
        probs["6"] += 10
        probs["W"] += 5

    if diff > 20:
        probs["4"] += 5
        probs["6"] += 5
        probs["W"] -= 4
    elif diff < -20:
        probs["W"] += 6
        probs["DOT"] += 5

    if free_hit:
        probs["W"] = 0
        probs["4"] += 15
        probs["6"] += 20
        probs["DOT"] = max(5, probs["DOT"] - 10)

    return probs


def choose_outcome(probs):
    total = sum(probs.values())
    r = random.randint(1, total)
    cumulative = 0
    for k, v in probs.items():
        cumulative += v
        if r <= cumulative:
            return k


# --------------------------
# Batting Selection
# --------------------------

def user_choose_openers(team):
    print("\nChoose two opening batsmen:")
    for i, p in enumerate(team):
        print(f"{i+1}. {p.name} (Bat:{p.batting})")

    first = int(input("First opener: ")) - 1
    second = int(input("Second opener: ")) - 1

    team[first].has_batted = True
    team[second].has_batted = True
    return team[first], team[second]


def ai_choose_openers(team):
    sorted_team = sorted(team, key=lambda x: x.batting, reverse=True)
    sorted_team[0].has_batted = True
    sorted_team[1].has_batted = True
    return sorted_team[0], sorted_team[1]


def user_next_batsman(team):
    available = [p for p in team if not p.is_out and not p.has_batted]
    if not available:
        return None

    print("\nChoose next batsman:")
    for i, p in enumerate(available):
        print(f"{i+1}. {p.name} (Bat:{p.batting})")

    choice = int(input("Select batsman: ")) - 1
    selected = available[choice]
    selected.has_batted = True
    return selected


def ai_next_batsman(team):
    available = [p for p in team if not p.is_out and not p.has_batted]
    if not available:
        return None
    best = sorted(available, key=lambda x: x.batting, reverse=True)[0]
    best.has_batted = True
    return best


# --------------------------
# Bowling Selection
# --------------------------

def user_choose_bowler(team, last_bowler):
    available = [p for p in team if p.overs_bowled < 4]

    filtered = [p for p in available if p != last_bowler]
    if filtered:
        available = filtered

    print("\nChoose Bowler:")
    for i, p in enumerate(available):
        print(f"{i+1}. {p.name} (Bowl:{p.bowling}) Overs:{p.overs_bowled}")

    choice = int(input("Select bowler: ")) - 1
    return available[choice]


def ai_choose_bowler(team, last_bowler):
    available = [p for p in team if p.overs_bowled < 4 and p != last_bowler]
    if not available:
        available = [p for p in team if p.overs_bowled < 4]
    return sorted(available, key=lambda x: x.bowling, reverse=True)[0]


# --------------------------
# Innings Simulation
# --------------------------

def simulate_innings(batting_team, bowling_team, user_bowling, target=None):
    total_runs = 0
    wickets = 0
    last_bowler = None

    free_hit = False

    striker, non_striker = (
        ai_choose_openers(batting_team)
        if user_bowling
        else user_choose_openers(batting_team)
    )

    for over in range(1, TOTAL_OVERS + 1):

        if wickets >= 10:
            break

        print(f"\n===== Over {over} =====")

        bowler = (
            user_choose_bowler(bowling_team, last_bowler)
            if user_bowling
            else ai_choose_bowler(bowling_team, last_bowler)
        )

        last_bowler = bowler
        bowler.overs_bowled += 1

        over_runs = 0
        over_events = []

        legal_balls = 0
        ball_number = 0

        while legal_balls < 6:

            if wickets >= 10:
                break

            if target and total_runs >= target:
                return total_runs

            ball_number += 1

            result = choose_outcome(get_probs(over, striker, bowler, free_hit))

            # WIDE
            if result == "WIDE":
                total_runs += 1
                over_runs += 1
                over_events.append("Wd")
                print(f"{over}.{ball_number} WIDE — Extra run.")
                continue

            # NO BALL
            if result == "NO BALL":
                total_runs += 1
                over_runs += 1
                over_events.append("Nb")
                print(f"{over}.{ball_number} NO BALL — Free hit coming!")
                free_hit = True
                continue

            # Legal delivery
            striker.balls_faced += 1
            legal_balls += 1

            if result == "DOT":
                over_events.append("0")
                print(f"{over}.{ball_number} 0 — {random.choice(commentary['DOT'])}")

            elif result == "W":
                wickets += 1
                striker.is_out = True
                bowler.wickets += 1
                over_events.append("W")
                print(f"{over}.{ball_number} W — {random.choice(commentary['W'])}")
                print(f"{striker.name} out for {striker.runs_scored}({striker.balls_faced})")

                if wickets >= 10:
                    break

                striker = (
                    ai_next_batsman(batting_team)
                    if user_bowling
                    else user_next_batsman(batting_team)
                )
                if striker is None:
                    break

            else:
                runs = int(result)
                total_runs += runs
                over_runs += runs
                striker.runs_scored += runs
                bowler.runs_conceded += runs
                over_events.append(str(runs))
                print(f"{over}.{ball_number} {runs} — {random.choice(commentary[str(runs)])}")

                if runs % 2 == 1:
                    striker, non_striker = non_striker, striker

            free_hit = False

        striker, non_striker = non_striker, striker

        print(f"\nOver Summary: ({', '.join(over_events)})")
        print(f"Runs this over: {over_runs}")
        print(f"{bowler.name} → Overs:{bowler.overs_bowled} Runs:{bowler.runs_conceded} Wkts:{bowler.wickets}")
        print(f"{striker.name} {striker.runs_scored}({striker.balls_faced})* | "
              f"{non_striker.name} {non_striker.runs_scored}({non_striker.balls_faced})")
        print(f"Score: {total_runs}/{wickets}")

        input("Press Enter to continue...")

    return total_runs


# --------------------------
# Match Flow
# --------------------------

reset_all_players()

print("Match Starting!")

user_bats_first = toss()

if user_bats_first:
    score1 = simulate_innings(our_team, opponent_team, False)
    print("\nOpponent need", score1 + 1, "to win.\n")
    score2 = simulate_innings(opponent_team, our_team, True, score1 + 1)
else:
    score1 = simulate_innings(opponent_team, our_team, True)
    print("\nTarget for you:", score1 + 1)
    score2 = simulate_innings(our_team, opponent_team, False, score1 + 1)

print("\nFinal Scores:")
print("Our Team:", score1 if user_bats_first else score2)
print("Opponent:", score2 if user_bats_first else score1)

if (user_bats_first and score1 > score2) or (not user_bats_first and score2 > score1):
    print("You win!")
else:
    print("Opponent wins!")
