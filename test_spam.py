import keyboard
import time

print("=" * 40)
print("  Simulating Keyboard Spam...")
print("  Will press 'a' rapidly for 10 seconds.")
print("=" * 40)

# Give user 2 seconds to switch window context if they want
time.sleep(2)

end_time = time.time() + 10
while time.time() < end_time:
    keyboard.press_and_release('a')
    time.sleep(0.05) # Press 'a' 20 times a second

print("\nFinished spam simulation.")
