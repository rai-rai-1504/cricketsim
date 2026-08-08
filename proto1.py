import random

TOTAL_OVERS = 20

# --------------------------
# Commentary
# --------------------------

commentary = {
    "Dot": [
        "Solid defence.",
        "Beaten outside off!",
        "Tight line and length.",
        "No run there."
    ],
    "1 run": [
        "Tucked away for a single.",
        "Keeps the scoreboard ticking.",
        "Quick run taken.",
        "Rotates strike."
    ],
    "2 runs": [
        "Good running, that's two.",
        "Back for the second!",
        "Nicely placed for a couple.",
        "Comfortable double."
    ],
    "3 runs": [
        "Excellent placement! Three taken.",
        "Brilliant running between wickets!",
        "They'll get three!",
        "Into the deep for three."
    ],
    "FOUR!": [
        "Races away to the boundary!",
        "Cracking shot!",
        "Pierces the gap!",
        "Beautiful timing!"
    ],
    "SIX!": [
        "That's huge!",
        "Into the stands!",
        "Massive strike!",
        "Clears the ropes!"
    ],
    "WICKET!": [
        "He's gone! Big breakthrough!",
        "Clean bowled!",
        "Taken safely!",
        "Massive wicket!"
    ]
}

# --------------------------
# Probability Engine
# --------------------------

def get_dynamic_probs(over, score, target, balls_remaining, free_hit=False):

    probs = {
        "Dot": 28,
        "1 run": 28,
        "2 runs": 14,
        "3 runs": 4,
        "FOUR!": 10,
        "SIX!": 6,
        "WICKET!": 8,
        "WIDE": 1,
        "NO BALL": 1
    }

    # Powerplay
    if over <= 6:
        probs["FOUR!"] += 6
        probs["WICKET!"] += 2

    # Middle overs
    elif 7 <= over <= 15:
        probs["1 run"] += 6

    # Death overs (more aggressive)
    else:
        probs["FOUR!"] += 12
        probs["SIX!"] += 12
        probs["WICKET!"] += 6
        probs["Dot"] -= 5

    # Free hit removes wicket chance
    if free_hit:
        probs["WICKET!"] = 0

    # Chasing aggression
    if target:
        runs_needed = target - score
        if balls_remaining > 0:
            required_rr = runs_needed / (balls_remaining / 6)
            current_rr = score / ((TOTAL_OVERS*6 - balls_remaining)/6 + 0.01)

            if required_rr > current_rr:
                probs["SIX!"] += 6
                probs["WICKET!"] += 5

    return probs


def choose_outcome(probs):
    total = sum(probs.values())
    rand = random.randint(1, total)
    cumulative = 0
    for outcome, prob in probs.items():
        cumulative += prob
        if rand <= cumulative:
            return outcome

# --------------------------
# Toss Setup
# --------------------------

def setup_match():

    team1 = input("Enter Team 1 name: ")
    team2 = input("Enter Team 2 name: ")

    print("\nChoose your team:")
    print(f"1. {team1}")
    print(f"2. {team2}")

    choice = input("Enter 1 or 2: ")
    user_team = team1 if choice == "1" else team2
    opponent = team2 if user_team == team1 else team1

    print("\nTime for the toss!")
    call = input("Heads or Tails? ").lower()

    toss_result = random.choice(["heads", "tails"])
    print(f"The coin lands on {toss_result.upper()}!")

    if call == toss_result:
        print("You won the toss!")
        decision = input("Bat or Bowl? ").lower()
        if decision == "bat":
            return user_team, opponent
        else:
            return opponent, user_team
    else:
        print("Opponent won the toss!")
        decision = random.choice(["bat", "bowl"])
        print(f"They choose to {decision}.")
        if decision == "bat":
            return opponent, user_team
        else:
            return user_team, opponent

# --------------------------
# Innings Simulation
# --------------------------

def play_innings(team_name, target=None):

    innings_over = False
    score = 0
    wickets = 0
    balls_bowled = 0
    balls_remaining = TOTAL_OVERS * 6
    free_hit = False

    print(f"\n--- {team_name} Innings Begins ---")

    for over in range(TOTAL_OVERS):

        if wickets >= 10 or innings_over:
            break

        print(f"\n===== Over {over+1} =====")

        over_events = []
        over_runs = 0
        ball_in_over = 0

        while ball_in_over < 6:

            if wickets >= 10:
                break

            if target and score >= target:
                innings_over = True
                break

            probs = get_dynamic_probs(over+1, score, target, balls_remaining, free_hit)
            result = choose_outcome(probs)

            # Handle extras
            if result == "WIDE":
                score += 1
                over_runs += 1
                over_events.append("Wd")
                print(f"{over}.{ball_in_over+1} : Wd — Wide ball.")
                continue

            if result == "NO BALL":
                score += 1
                over_runs += 1
                free_hit = True
                over_events.append("Nb")
                print(f"{over}.{ball_in_over+1} : Nb — No ball! Free hit coming.")
                continue

            # Legal delivery
            ball_in_over += 1
            balls_bowled += 1
            balls_remaining -= 1

            ball_label = f"{over}.{ball_in_over}"

            if result == "Dot":
                over_events.append("0")
                print(f"{ball_label} : 0 — {random.choice(commentary['Dot'])}")

            elif result == "1 run":
                score += 1
                over_runs += 1
                over_events.append("1")
                print(f"{ball_label} : 1 — {random.choice(commentary['1 run'])}")

            elif result == "2 runs":
                score += 2
                over_runs += 2
                over_events.append("2")
                print(f"{ball_label} : 2 — {random.choice(commentary['2 runs'])}")

            elif result == "3 runs":
                score += 3
                over_runs += 3
                over_events.append("3")
                print(f"{ball_label} : 3 — {random.choice(commentary['3 runs'])}")

            elif result == "FOUR!":
                score += 4
                over_runs += 4
                over_events.append("4")
                print(f"{ball_label} : 4 — {random.choice(commentary['FOUR!'])}")

            elif result == "SIX!":
                score += 6
                over_runs += 6
                over_events.append("6")
                print(f"{ball_label} : 6 — {random.choice(commentary['SIX!'])}")

            elif result == "WICKET!":
                wickets += 1
                over_events.append("W")
                print(f"{ball_label} : W — {random.choice(commentary['WICKET!'])}")

            free_hit = False

            if target and score >= target:
                innings_over = True
                break

        if innings_over :
            print("and they finish off the match with overs remaining")
            break

        print(f"Over summary: ({', '.join(over_events)}) | Runs this over: {over_runs}")

        overs_completed = balls_bowled / 6
        crr = score / overs_completed if overs_completed > 0 else 0

        print(f"Score: {score}/{wickets} | CRR: {round(crr,2)}")

        if target:
            runs_needed = target - score
            print(f"{runs_needed} runs needed in {balls_remaining} balls")

        input("Press Enter to continue...")

    print(f"\n{team_name} finish with {score}/{wickets}\n")
    return score

# --------------------------
# Match Summary
# --------------------------

def match_summary(team1, team2, score1, score2):

    print("\n===== MATCH SUMMARY =====")

    if score1 > score2:
        print(f"{team1} win by {score1 - score2} runs.")
    elif score2 > score1:
        print(f"{team2} chase successfully and win!")
    else:
        print("It's a tie! What a thriller!")

    print("\nAnalysis:")
    print("- Powerplay shaped early momentum.")
    print("- Death overs brought high risk, high reward cricket.")
    print("- Key wickets shifted pressure at crucial stages.")
    print("\nA fantastic contest!")

# --------------------------
# Run Match
# --------------------------

batting_first, bowling_first = setup_match()

score1 = play_innings(batting_first)
score2 = play_innings(bowling_first, target=score1 + 1)

match_summary(batting_first, bowling_first, score1, score2)
