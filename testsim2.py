import random

OVERS_PER_DAY = 90
NEW_BALL_AFTER = 80
NEW_BALL_BONUS_OVERS = 15

commentary = {
    "DOT": ["Solid defence.", "Beaten outside off!", "Watchful leave."],
    "1": ["Tucked for one.", "Easy single."],
    "2": ["Back for two!", "Good running."],
    "4": ["Cracking drive!", "Races away!"],
    "6": ["Massive hit!", "Into the stands!"],
    "W": ["He's gone!", "Edge and taken!", "Clean bowled!"]
}

entry_lines = [
    "{} walks in under pressure.",
    "Here comes {}.",
    "{} strides confidently to the crease.",
    "Big moment for {}."
]


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


# =========================================================
# SAFE BATSMAN SELECTION
# =========================================================

def choose_batsman_user(state):
    available = [p for p in state.batting_team if not p.has_batted and not p.is_out]

    if not available:
        return None

    print("\nChoose next batsman:")
    for i, p in enumerate(available):
        print(f"{i+1}. {p.name} (Bat:{p.batting})")

    choice = int(input("Select batsman: ")) - 1

    if choice < 0 or choice >= len(available):
        choice = 0

    player = available[choice]
    player.has_batted = True

    print(random.choice(entry_lines).format(player.name))

    return player


def choose_batsman_ai(state):
    available = [p for p in state.batting_team if not p.has_batted and not p.is_out]

    if not available:
        return None

    player = sorted(available, key=lambda x: x.batting, reverse=True)[0]
    player.has_batted = True
    print(random.choice(entry_lines).format(player.name))
    return player


# =========================================================
# FIXED BOWLER LOGIC
# =========================================================

def choose_bowler(state, user_bowling):

    if user_bowling:
        print("\nChoose Bowler:")
        for i, p in enumerate(state.bowling_team):
            print(f"{i+1}. {p.name} Overs:{p.overs_bowled}")

        choice = int(input("Select bowler: ")) - 1
        if choice < 0 or choice >= len(state.bowling_team):
            choice = 0

        selected = state.bowling_team[choice]

        # Prevent consecutive overs
        if selected == state.last_bowler:
            print("Cannot bowl consecutive overs. Selecting next available bowler.")
            for p in state.bowling_team:
                if p != state.last_bowler:
                    selected = p
                    break

        state.last_bowler = selected
        return selected

    else:
        # ----- AI Bowling Rotation (SPELL LOGIC UNCHANGED) -----

        if state.ai_bowlers is None:
            state.ai_bowlers = sorted(
                state.bowling_team,
                key=lambda x: x.bowling,
                reverse=True
            )[:6]

            state.ai_bowler_index = 0
            state.ai_spell_counter = 0

        bowler = state.ai_bowlers[state.ai_bowler_index]

        # Prevent consecutive overs
        if bowler == state.last_bowler:
            state.ai_bowler_index = (state.ai_bowler_index + 1) % len(state.ai_bowlers)
            bowler = state.ai_bowlers[state.ai_bowler_index]

        state.ai_spell_counter += 1

        # SPELL LOGIC LEFT EXACTLY AS YOU WROTE IT
        if state.ai_spell_counter >= 5:
            state.ai_spell_counter = 0
            state.ai_bowler_index += 1

            if state.ai_bowler_index >= len(state.ai_bowlers):
                state.ai_bowler_index = 0

        state.last_bowler = bowler
        return bowler


# =========================================================
# PROBABILITY
# =========================================================

def get_probabilities(batsman, bowler, pitch, mentality, new_ball_bonus):

    if pitch == "FLAT":
        probs = {"DOT": 30, "1": 50, "2": 15, "4": 5, "6": 1, "W": 3}
    else:
        probs = {"DOT": 40, "1": 35, "2": 8, "4": 2, "6": 0, "W": 7}

    if new_ball_bonus:
        probs["W"] += 1 if pitch == "FLAT" else 2

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
# INNINGS WITH CLEAN 10 WICKET STOP
# =========================================================

def play_innings(state, user_batting, user_bowling):

    if user_batting:
        state.striker = choose_batsman_user(state)
        state.non_striker = choose_batsman_user(state)
    else:
        state.striker = choose_batsman_ai(state)
        state.non_striker = choose_batsman_ai(state)

    while state.wickets < 10:

        state.over += 1
        print(f"\n=== Over {state.over} | Score {state.total_runs}/{state.wickets} ===")

        bowler = choose_bowler(state, user_bowling)
        bowler.overs_bowled += 1

        for ball in range(1, 7):

            if state.wickets >= 10:
                break

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
                print(f"{state.striker.name} OUT for {state.striker.runs_scored}")
                if state.wickets >= 10:
                    break

                if user_batting:
                    state.striker = choose_batsman_user(state)
                else:
                    state.striker = choose_batsman_ai(state)

                continue

            runs = 0 if result == "DOT" else int(result)
            state.total_runs += runs
            state.striker.runs_scored += runs

            if runs % 2 == 1:
                state.striker, state.non_striker = state.non_striker, state.striker

        state.striker, state.non_striker = state.non_striker, state.striker

    print(f"\n{state.team_name} ALL OUT for {state.total_runs}")
    return state.total_runs


# =========================================================
# MAIN WITH LEAD/TRAIL
# =========================================================

def main():

    our_team = [Player("Daksh",75,87),Player("Shatam",80,20)]
    opponent_team = [Player("Vandan",84,46),Player("Paradox",88,39)]

    pitch = random.choice(["FLAT","GREEN"])
    print("Pitch:", pitch)

    first = play_innings(InningsState(our_team, opponent_team, pitch, "IND 1st"), True, False)
    second = play_innings(InningsState(opponent_team, our_team, pitch, "AUS 1st"), False, True)

    lead = first - second
    print("\nLead after 1st innings:", lead)

    third = play_innings(InningsState(our_team, opponent_team, pitch, "IND 2nd"), True, False)

    target = lead + third
    print("\nTarget for final innings:", target)

    fourth = play_innings(InningsState(opponent_team, our_team, pitch, "AUS 2nd"), False, True)

    if fourth > target:
        print("AUS wins")
    else:
        print("IND wins")


if __name__ == "__main__":
    main()
