import random

OVERS_PER_DAY = 90
NEW_BALL_AFTER = 80
NEW_BALL_BONUS_OVERS = 8

commentary = {
    "DOT": ["Solid defence.", "Beaten outside off!", "Watchful leave."],
    "1": ["Tucked for one.", "Easy single."],
    "2": ["Back for two!", "Good running."],
    "4": ["Cracking drive!", "Races away!"],
    "6": ["Massive hit!", "Into the stands!"],
    "W": ["He's gone!", "Edge and taken!", "Clean bowled!", "taken in the third slip", "oh my lord thats a beauty", "another one departs", "this is insane from this bloke", "no fucking chance for him", "thats sheer luck for the bowler", "a fucking sitter, good bowl", "I HAVE NEVER SEEN A DELIVERY LIKE THAT, GOOD LORD", "he was looking good today, loses concentration and gives away his wicket", "oh lord this guy is doing wonders"]
}

entry_lines = [
    "{} walks in under pressure.",
    "Here comes {}.",
    "{} strides confidently to the crease.",
    "Big moment for {}."
]

match_scorecard = {
    "IND 1st": {"batting": [], "bowling": []},
    "AUS 1st": {"batting": [], "bowling": []},
    "IND 2nd": {"batting": [], "bowling": []},
    "AUS 2nd": {"batting": [], "bowling": []},
}

# =========================================================
# DOMAIN
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
        self.mentality = "defensive"
        self.overs_bowled = 0
        self.runs_conceded = 0
        self.wickets = 0


class InningsState:
    def __init__(self, batting_team, bowling_team, pitch, team_name):
        self.batting_team = batting_team
        self.bowling_team = bowling_team
        self.pitch = pitch
        self.team_name = team_name
        self.total_runs = 0
        self.wickets = 0
        self.over = 0
        self.striker = None
        self.non_striker = None
        self.new_ball_overs_left = NEW_BALL_BONUS_OVERS
        self.ai_bowlers = None
        self.ai_bowler_index = 0
        self.ai_spell_counter = 0
        self.last_bowler = None

def reset_for_new_innings(team):
    for p in team:
        p.runs_scored = 0
        p.balls_faced = 0
        p.is_out = False
        p.has_batted = False


def record_batting_scorecard(state):

    batting = []

    for p in state.batting_team:
        if p.has_batted or p.balls_faced > 0:
            batting.append({
                "name": p.name,
                "runs": p.runs_scored,
                "balls": p.balls_faced,
                "out": p.is_out
            })

    match_scorecard[state.team_name]["batting"] = batting


def record_bowling_scorecard(state):

    bowling = []

    for p in state.bowling_team:
        if p.overs_bowled > 0:
            bowling.append({
                "name": p.name,
                "overs": p.overs_bowled,
                "runs": p.runs_conceded,
                "wkts": p.wickets
            })

    match_scorecard[state.team_name]["bowling"] = bowling

# =========================================================
# SETUP
# =========================================================

def choose_pitch():
    pitch = random.choice(["FLAT", "GREEN"])
    print("\n=== Pitch Report ===")
    if pitch == "FLAT":
        print("Flat pitch. 350-400 is par.")
    else:
        print("Green pitch. 250 is competitive.")
    return pitch


def toss(pitch):
    print("\n================ TOSS ================")
    call = input("Heads or Tails? ").lower()
    result = random.choice(["heads", "tails"])
    print("Coin landed on:", result.upper())

    if call == result:
        print("You won the toss!")
        decision = input("Bat or Bowl? ").lower()
        return decision == "bat"

    else:
        print("Opponent won the toss.")
        if pitch == "GREEN":
            decision = "bowl"
        else:
            decision = "bat"
        print("Opponent chooses to", decision)

        if decision == "bat":
            return False  # opponent bats first
        else:
            return True   # you bat first


# =========================================================
# PROBABILITY
# =========================================================

def get_probabilities(batsman, bowler, pitch, mentality, new_ball_bonus):

    if pitch == "FLAT":
        probs = {"DOT": 120, "1": 43, "2": 15, "4": 18, "6": 2, "W": 6}
    else:
        probs = {"DOT": 150, "1": 60, "2": 20, "4": 10, "6": 1, "W": 11}

    diff = batsman.batting - bowler.bowling

    
    # 5 to 9
    if 5 <= diff < 10:
        probs["4"] += 2
        probs["6"] += 0

    elif -10 < diff <= -5:
        probs["W"] += 1
        probs["DOT"] += 10
        probs["4"] = max(0, probs["4"] - 1)


    # 10 to 19
    if 10 <= diff < 20:
        probs["4"] += 5
        probs["6"] += 1
        probs["W"] = max(0, probs["W"] - 1)

    elif -20 < diff <= -10:
        probs["W"] += 3
        probs["DOT"] += 20
        probs["4"] = max(0, probs["4"] - 2)
        probs["6"] = 0


    # 20 to 29
    if 20 <= diff < 30:
        probs["4"] += 20
        probs["6"] += 3
        probs["W"] = max(0, probs["W"] - 3)
        probs["DOT"] -= max(0, probs["DOT"] - 15)

    elif -30 < diff <= -20:
        probs["W"] += 5
        probs["DOT"] += 30
        probs["4"] = max(0, probs["4"] - 4)
        probs["6"] = 0

    if diff > 30 :
        probs["4"] += 30
        probs["6"] += 5

    elif diff < -30 :
        probs["W"] += 8
        probs["DOT"] += 40
        probs["4"] = 0
        probs["6"] = 0

    if mentality == "attack":
        if pitch == "GREEN" :
            probs["4"] += 10
            probs["6"] += 3
            probs["W"] += 5
        else :
            probs["4"] += 10
            probs["6"] += 5
            probs["W"] += 2
        
    elif mentality == "ultra defensive":
        if pitch == "GREEN":
            probs["DOT"] += 30
            probs["4"] = max(0, probs["4"] - 6)
            probs["6"] = max(0, probs["6"] - 1)
            probs["W"] = max(0, probs["W"] - 5)
        else :
            probs["DOT"] += 20
            probs["4"] = max(0, probs["4"] - 10)
            probs["6"] = max(0, probs["6"] - 1)
            probs["W"] = max(0, probs["W"] - 2)            

    if new_ball_bonus:
        probs["W"] += 1 if pitch == "FLAT" else 3

    for k in probs:
        probs[k] = max(0, probs[k])

    return probs


def choose_outcome(probs):
    total = sum(probs.values())
    r = random.randint(1, total)
    cumulative = 0
    for k, v in probs.items():
        cumulative += v
        if r <= cumulative:
            return k


# =========================================================
# PRINT FUNCTIONS
# =========================================================

def print_ball(over, ball, result):
    if result == "DOT":
        print(f"{over}.{ball} 0 — {random.choice(commentary['DOT'])}")
    elif result == "W":
        print(f"{over}.{ball} W — {random.choice(commentary['W'])}")
    else:
        print(f"{over}.{ball} {result} — {random.choice(commentary[str(result)])}")


def print_over_summary(events, runs, state, bowler):
    print(f"\nOver Summary: ({', '.join(events)})")
    print(f"Runs this over: {runs}")
    print(f"{bowler.name} → Overs:{bowler.overs_bowled} Runs:{bowler.runs_conceded} Wkts:{bowler.wickets}")
    print(f"{state.striker.name} {state.striker.runs_scored}({state.striker.balls_faced})* | "
          f"{state.non_striker.name} {state.non_striker.runs_scored}({state.non_striker.balls_faced})")
    print(f"Score: {state.total_runs}/{state.wickets}")
    input("Press Enter to continue...")

def print_match_scorecard():

    print("\n\n========== FULL MATCH SCORECARD ==========")

    for innings, data in match_scorecard.items():

        print(f"\n\n----- {innings} -----")

        print("\nBatting:")
        print(f"{'Player':20} {'Runs':5} {'Balls':5} {'Out'}")

        for b in data["batting"]:
            status = "out" if b["out"] else "not out"
            print(f"{b['name']:20} {b['runs']:5} {b['balls']:5} {status}")

        print("\nBowling:")
        print(f"{'Bowler':20} {'Overs':5} {'Runs':5} {'Wkts'}")

        for bw in data["bowling"]:
            print(f"{bw['name']:20} {bw['overs']:5} {bw['runs']:5} {bw['wkts']}")


# =========================================================
# COACH
# =========================================================

def choose_batsman_user(state):
    available = [p for p in state.batting_team if not p.has_batted and not p.is_out]

    print("\nChoose next batsman:")
    for i, p in enumerate(available):
        print(f"{i+1}. {p.name} (Bat:{p.batting})")

    choice = int(input("Select batsman: ")) - 1
    player = available[choice]
    player.has_batted = True

    print(random.choice(entry_lines).format(player.name))

    print("1.Attack 2.Defensive 3.Ultra Defensive")
    m = input("Choice: ")
    if m == "1":
        player.mentality = "attack"
    elif m == "3":
        player.mentality = "ultra defensive"
    else:
        player.mentality = "defensive"

    return player

def choose_batsman_ai(state):
    available = [p for p in state.batting_team if not p.has_batted and not p.is_out]
    player = sorted(available, key=lambda x: x.batting, reverse=True)[0]
    player.has_batted = True
    player.mentality = "defensive"
    print(random.choice(entry_lines).format(player.name))
    return player

def choose_bowler(state, user_bowling):

    if user_bowling:
        while True:
            print("\nChoose Bowler:")
            for i, p in enumerate(state.bowling_team):
                print(f"{i+1}. {p.name} Overs:{p.overs_bowled}")

            choice = int(input("Select bowler: ")) - 1

            if choice < 0 or choice >= len(state.bowling_team):
                print("Invalid choice. Try again.")
                continue

            selected = state.bowling_team[choice]

            # HARD BLOCK consecutive overs
            if selected == state.last_bowler:
                print("A bowler cannot bowl consecutive overs. Choose another bowler.")
                continue

            state.last_bowler = selected
            return selected

    else:
        # ----- AI Bowling Rotation -----


        if state.ai_bowlers is None:
            state.ai_bowlers = sorted(
                state.bowling_team,
                key=lambda x: x.bowling,
                reverse=True
            )[:6]

            state.ai_bowler_index = 0
            state.ai_spell_counter = 0

        bowler = state.ai_bowlers[state.ai_bowler_index]

        # Prevent consecutive overs WITHOUT corrupting spell logic
        if bowler == state.last_bowler:
            state.ai_bowler_index = (state.ai_bowler_index + 1) % len(state.ai_bowlers)
            state.ai_spell_counter = 0
            bowler = state.ai_bowlers[state.ai_bowler_index]

        state.ai_spell_counter += 1

        if state.ai_spell_counter >= 5:
            state.ai_spell_counter = 0
            state.ai_bowler_index = (state.ai_bowler_index + 1) % len(state.ai_bowlers)

        state.last_bowler = bowler
        return bowler

# =========================================================
# INNINGS
# =========================================================

def play_innings(state, user_batting, user_bowling, target=None):

    if user_batting:
        state.striker = choose_batsman_user(state)
        state.non_striker = choose_batsman_user(state)
    else:
        state.striker = choose_batsman_ai(state)
        state.non_striker = choose_batsman_ai(state)

    for over in range(1, 450):

        if state.wickets >= 10:
           break

        print("\n======================================")
        print(f"Over {over} Begins  |  Score: {state.total_runs}/{state.wickets}")
        print("======================================")



        state.over = over
        bowler = choose_bowler(state, user_bowling)
        bowler.overs_bowled += 1

        over_events = []
        over_runs = 0

        for ball in range(1, 7):

            probs = get_probabilities(
                state.striker,
                bowler,
                state.pitch,
                state.striker.mentality,
                state.new_ball_overs_left > 0
            )

            result = choose_outcome(probs)

            state.striker.balls_faced += 1

            if result == "W":
                state.wickets += 1
                state.striker.is_out = True
                bowler.wickets += 1
                print_ball(over, ball, "W")
                print(f"{state.striker.name} out for {state.striker.runs_scored}({state.striker.balls_faced})")
                over_events.append("W")

                if state.wickets >= 10:
                    print_over_summary(over_events, over_runs, state, bowler)
                    record_batting_scorecard(state)
                    record_bowling_scorecard(state)
                    return   # <-- THIS ends innings immediately

                if user_batting:
                    state.striker = choose_batsman_user(state)
                else:
                    state.striker = choose_batsman_ai(state)

                continue            

            runs = 0 if result == "DOT" else int(result)
            state.total_runs += runs
            if target is not None and state.total_runs >= target:
                print("\nTarget achieved!")
                print_over_summary(over_events, over_runs, state, bowler)
                record_batting_scorecard(state)
                record_bowling_scorecard(state)
                return            
            state.striker.runs_scored += runs
            bowler.runs_conceded += runs

            print_ball(over, ball, result)

            over_events.append("0" if result == "DOT" else result)
            over_runs += runs

            if runs % 2 == 1:
                state.striker, state.non_striker = state.non_striker, state.striker

        if state.new_ball_overs_left > 0:
            state.new_ball_overs_left -= 1

        if over == NEW_BALL_AFTER:
            print("\nNew ball taken!")
            state.new_ball_overs_left = NEW_BALL_BONUS_OVERS

        state.striker, state.non_striker = state.non_striker, state.striker

        print_over_summary(over_events, over_runs, state, bowler)


# =========================================================
# MAIN
# =========================================================

def main():

    our_team = [
        
        Player("Shatam Rai", 87, 20),
        Player("Akash Sinha (WK)", 85, 65),
        Player("Pranath V", 75, 10),
        Player("Vinod Prajapati", 74, 86),
        Player("Daksh Dosi (c)", 95, 92),
        Player("Krishiv", 76, 25),
        Player("Kushagra", 31, 81),
        Player("Ratna Deep", 88, 81),
        Player("Rohit Yadav", 15, 77),
        Player("Krishna Dubey", 35, 87),
        Player("Teena Naruka", 92, 69),
    ]

    opponent_team = [
        Player("Vandan", 84, 46),
        Player("Atharva Bhavesh", 72, 79),
        Player("Paradox", 88, 39),
        Player("Anto", 61, 78),
        Player("Soumyajyoti Dey", 75, 52),
        Player("Vaibhav Nagpal", 69, 75),
        Player("Sai Siddhant", 83, 57),
        Player("Arpita Ghosh", 66, 80),
        Player("Dean M", 58, 86),
        Player("Vecna", 77, 63),        
        Player("Pushkal Gupta", 54, 88),
    ]

    pitch = choose_pitch()
    user_bats_first = toss(pitch)

    # Reset players before match
    for p in our_team + opponent_team:
        p.reset()

    total_ind_1 = total_aus_1 = 0
    total_ind_2 = total_aus_2 = 0

    # Determine which team bats first
    if user_bats_first:
        first_team = our_team
        second_team = opponent_team
        first_name = "IND"
        second_name = "AUS"
        first_user = True
    else:
        first_team = opponent_team
        second_team = our_team
        first_name = "AUS"
        second_name = "IND"
        first_user = False


    # ---------------- 1st INNINGS ----------------

    print(f"\n--- {first_name} 1st Innings ---")
    reset_for_new_innings(first_team)
    state1 = InningsState(first_team, second_team, pitch, f"{first_name} 1st")
    play_innings(state1, first_user, not first_user)
    total_first_1 = state1.total_runs


    # ---------------- 2nd INNINGS ----------------

    print(f"\n--- {second_name} 1st Innings ---")
    reset_for_new_innings(second_team)
    state2 = InningsState(second_team, first_team, pitch, f"{second_name} 1st")
    play_innings(state2, not first_user, first_user)
    total_second_1 = state2.total_runs


    lead = total_first_1 - total_second_1
    if lead > 0:
        print(f"\n{first_name} lead by {lead} runs")
    elif lead < 0:
        print(f"\n{second_name} lead by {-lead} runs")
    else:
        print("\nScores level after 1st innings")


    # ---------------- 3rd INNINGS ----------------
    # ALWAYS SAME TEAM AS 1ST INNINGS

    print(f"\n--- {first_name} 2nd Innings ---")
    reset_for_new_innings(first_team)
    state3 = InningsState(first_team, second_team, pitch, f"{first_name} 2nd")
    play_innings(state3, first_user, not first_user)
    total_first_2 = state3.total_runs


    # ---------------- 4th INNINGS ----------------

    combined_first = total_first_1 + total_first_2
    combined_second = total_second_1

    target = combined_first - combined_second
    print(f"\nTarget for {second_name}: {target + 1}")

    print(f"\n--- {second_name} 2nd Innings ---")
    reset_for_new_innings(second_team)
    state4 = InningsState(second_team, first_team, pitch, f"{second_name} 2nd")
    play_innings(state4, not first_user, first_user, target=target + 1)
    total_second_2 = state4.total_runs

    combined_second += total_second_2


    # ---------------- RESULT ----------------

    print("\n========== RESULT ==========")

    if combined_second > combined_first:
        print(f"{second_name} wins by {10 - state4.wickets} wickets")
    elif combined_second < combined_first:
        print(f"{first_name} wins by {combined_first - combined_second} runs")
    else:
        print("Match Tied")

    print_match_scorecard()    


if __name__ == "__main__":
    main()
