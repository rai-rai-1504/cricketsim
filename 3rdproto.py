import random

TOTAL_OVERS = 20

# =========================================================
# DOMAIN LAYER
# =========================================================

class Player:
    def __init__(self, name, batting, bowling):
        self.name = name
        self.batting = batting
        self.bowling = bowling
        self.reset()

    def reset(self):
        self.runs_scored = 0
        self.balls_faced = 0
        self.is_out = False
        self.has_batted = False

        self.overs_bowled = 0
        self.runs_conceded = 0
        self.wickets = 0


class MatchState:
    def __init__(self, batting_team, bowling_team, target=None):
        self.batting_team = batting_team
        self.bowling_team = bowling_team
        self.target = target

        self.total_runs = 0
        self.wickets = 0
        self.over = 0
        self.free_hit = False
        self.last_bowler = None

        self.striker = None
        self.non_striker = None


# =========================================================
# ENGINE LAYER (NO PRINT / NO INPUT)
# =========================================================

commentary = {
    "DOT": ["Solid defence.", "Beaten outside off!", "No run there."],
    "1": ["Tucked for a single.", "Keeps strike rotating."],
    "2": ["Back for two!", "Easy double."],
    "3": ["Brilliant running!"],
    "4": ["Races away!", "Cracking cover drive!"],
    "6": ["That's massive!", "Into the stands!"],
    "W": ["He's gone!", "Clean bowled!"]
    
}

entry_lines = [
    "Now {} walks in under pressure.",
    "Here comes {} — big moment.",
    "{} strides out to the crease.",
    "Now {} is coming onto the field, let's see what this bloke does."
]

def get_probabilities(over, batsman, bowler, free_hit):
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
        probs["6"] += 5

    if over >= 16:
        probs["4"] += 20
        probs["6"] += 20
        probs["W"] += 10

    # 5 to 9
    if 5 <= diff < 10:
        probs["4"] += 5
        probs["6"] += 5
        probs["W"] = max(0, probs["W"] - 4)

    elif -10 < diff <= -5:
        probs["W"] += 2
        probs["DOT"] += 5
        probs["4"] = max(0, probs["4"] - 5)
        probs["6"] = max(0, probs["6"] - 5)


    # 10 to 19
    if 10 <= diff < 20:
        probs["4"] += 15
        probs["6"] += 15
        probs["W"] = max(0, probs["W"] - 15)

    elif -20 < diff <= -10:
        probs["W"] += 5
        probs["DOT"] += 10
        probs["4"] = max(0, probs["4"] - 10)
        probs["6"] = max(0, probs["6"] - 10)


    # 20 to 29
    if 20 <= diff < 30:
        probs["4"] += 25
        probs["6"] += 25
        probs["W"] -=5

    elif -30 < diff <= -20:
        probs["W"] += 20
        probs["DOT"] += 20
        probs["4"] = max(0, probs["4"] - 20)
        probs["6"] = max(0, probs["6"] - 20)

    if diff > 30 :
        probs["4"] += 40
        probs["6"] += 40
        probs["W"] = 0

    elif diff < -30 :
        probs["W"] += 30
        probs["DOT"] += 40
        probs["4"] = 0
        probs["6"] = 0
        
        

    if free_hit:
        probs["W"] = 0
        probs["4"] += 15
        probs["6"] += 20
        probs["DOT"] -= 10

    return probs


def choose_outcome(probs):
    total = sum(probs.values())
    r = random.randint(1, total)
    cumulative = 0
    for k, v in probs.items():
        cumulative += v
        if r <= cumulative:
            return k


def simulate_ball(state, bowler):
    result = choose_outcome(
        get_probabilities(state.over, state.striker, bowler, state.free_hit)
    )

    event = {"type": result, "runs": 0}

    if result == "WIDE":
        state.total_runs += 1
        event["runs"] = 1
        return event, False

    if result == "NO BALL":
        state.total_runs += 1
        state.free_hit = True
        event["runs"] = 1
        return event, False

    # legal ball
    state.striker.balls_faced += 1
    state.free_hit = False

    if result == "DOT":
        return event, True

    if result == "W":
        state.wickets += 1
        state.striker.is_out = True
        bowler.wickets += 1
        return event, True

    runs = int(result)
    state.total_runs += runs
    state.striker.runs_scored += runs
    bowler.runs_conceded += runs
    event["runs"] = runs

    if runs % 2 == 1:
        state.striker, state.non_striker = state.non_striker, state.striker

    return event, True


# =========================================================
# MATCH FLOW LAYER
# =========================================================

def play_innings(state, user_bowling, user_batting):

    for over in range(1, TOTAL_OVERS + 1):
        if state.wickets >= 10:
            break

        state.over = over
        print(f"\n===== Over {over} =====")

        bowler = choose_bowler(state, user_bowling)
        state.last_bowler = bowler
        bowler.overs_bowled += 1

        over_events = []
        over_runs = 0
        legal_balls = 0
        ball_number = 0

        while legal_balls < 6:

            if state.wickets >= 10:
                break

            if state.target and state.total_runs >= state.target:
                return

            ball_number += 1

            event, legal = simulate_ball(state, bowler)
            over_events.append(event["type"])
            over_runs += event["runs"]

            print_ball(over, ball_number, event, state)

            if legal:
                legal_balls += 1

            if event["type"] == "W":
                 dismissed_player = state.striker

                 print(f"\n{dismissed_player.name} got out after scoring "
                     f"{dismissed_player.runs_scored}({dismissed_player.balls_faced})")

                 if state.wickets < 10:
                     new_batsman = choose_next_batsman(state, user_batting)

                     if new_batsman:
                          print(random.choice(entry_lines).format(new_batsman.name))

                     state.striker = new_batsman

        state.striker, state.non_striker = state.non_striker, state.striker

        print_over_summary(over_events, over_runs, state, bowler)


# =========================================================
# PRESENTATION LAYER
# =========================================================

def print_ball(over, ball, event, state):
    if event["type"] in ["WIDE", "NO BALL"]:
        print(f"{over}.{ball} {event['type']} — Extra run.")
        return

    if event["type"] == "DOT":
        print(f"{over}.{ball} 0 — {random.choice(commentary['DOT'])}")
    elif event["type"] == "W":
        print(f"{over}.{ball} W — {random.choice(commentary['W'])}")
    else:
        runs = event["runs"]
        print(f"{over}.{ball} {runs} — {random.choice(commentary[str(runs)])}")


def print_over_summary(events, runs, state, bowler):
    formatted = []
    for e in events:
        if e == "DOT":
            formatted.append("0")
        elif e == "WIDE":
            formatted.append("Wd")
        elif e == "NO BALL":
            formatted.append("Nb")
        else:
            formatted.append(e)

    print(f"\nOver Summary: ({', '.join(formatted)})")
    print(f"Runs this over: {runs}")
    print(f"{bowler.name} → Overs:{bowler.overs_bowled} Runs:{bowler.runs_conceded} Wkts:{bowler.wickets}")
    print(f"{state.striker.name} {state.striker.runs_scored}({state.striker.balls_faced})* | "
          f"{state.non_striker.name} {state.non_striker.runs_scored}({state.non_striker.balls_faced})")
    print(f"Score: {state.total_runs}/{state.wickets}")
    input("Press Enter to continue...")


def choose_next_batsman(state, user_batting):
    available = [p for p in state.batting_team if not p.is_out and not p.has_batted]
    if not available:
        return None

    if user_batting:
        print("\nChoose next batsman:")
        for i, p in enumerate(available):
            print(f"{i+1}. {p.name} (Bat:{p.batting})")
        choice = int(input("Select batsman: ")) - 1
        selected = available[choice]
    else:
        selected = sorted(available, key=lambda x: x.batting, reverse=True)[0]

    selected.has_batted = True
    return selected


def choose_bowler(state, user_bowling):
    available = [p for p in state.bowling_team if p.overs_bowled < 4]
    filtered = [p for p in available if p != state.last_bowler]
    if filtered:
        available = filtered

    if user_bowling:
        print("\nChoose Bowler:")
        for i, p in enumerate(available):
            print(f"{i+1}. {p.name} Overs:{p.overs_bowled}")
        choice = int(input("Select bowler: ")) - 1
        return available[choice]
    else:
        return sorted(available, key=lambda x: x.bowling, reverse=True)[0]


def toss():
    call = input("Heads or Tails? ").lower()
    result = random.choice(["heads", "tails"])
    print("Coin landed on:", result.upper())

    if call == result:
        decision = input("You won the toss! Bat or Bowl? ").lower()
        return decision == "bat"
    else:
        decision = random.choice(["bat", "bowl"])
        print("Opponent chooses to", decision)
        return decision == "bowl"


# =========================================================
# MAIN MATCH FLOW
# =========================================================

def reset_team(team):
    for p in team:
        p.reset()


def main():

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
        Player("Vaibhav Nagpal", 69, 69),
        Player("Sai Siddhant", 83, 57),
        Player("Arpita Ghosh", 66, 74),
        Player("Dean M", 58, 80),
        Player("Vecna", 77, 63),
        Player("Pushkal Gupta", 54, 88),
    ]

    print("Match Starting!")

    user_bats_first = toss()

    reset_team(our_team)
    reset_team(opponent_team)

    if user_bats_first:
        state1 = MatchState(our_team, opponent_team)
        state1.striker, state1.non_striker = choose_next_batsman(state1, True), choose_next_batsman(state1, True)
        play_innings(state1, False, True)

        print("\nOpponent needs", state1.total_runs + 1)
        state2 = MatchState(opponent_team, our_team, state1.total_runs + 1)
        state2.striker, state2.non_striker = choose_next_batsman(state2, False), choose_next_batsman(state2, False)
        play_innings(state2, True, False)

    else:
        state1 = MatchState(opponent_team, our_team)
        state1.striker, state1.non_striker = choose_next_batsman(state1, False), choose_next_batsman(state1, False)
        play_innings(state1, True, False)

        print("\nTarget:", state1.total_runs + 1)
        state2 = MatchState(our_team, opponent_team, state1.total_runs + 1)
        state2.striker, state2.non_striker = choose_next_batsman(state2, True), choose_next_batsman(state2, True)
        play_innings(state2, False, True)

    print("\nFinal Scores:")
    print("Our Team:", state2.total_runs if not user_bats_first else state1.total_runs)
    print("Opponent:", state1.total_runs if not user_bats_first else state2.total_runs)


if __name__ == "__main__":
    main()
