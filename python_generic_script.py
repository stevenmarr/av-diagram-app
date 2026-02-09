# send_test_node_to_react.py
"""
Stand-alone Python script that:
1. Builds a realistic node JSON modeled after the Blackmagic Constellation 2 M/E switcher
2. Sends it via HTTP POST directly to the React dev server (Vite) at http://localhost:3000/api/add-node

Requirements:
- pip install requests
- React dev server running (npm run dev in frontend folder)

Run this script while the React frontend is active.
"""

import requests
import json
from datetime import datetime

# Where the React server is listening for POST requests
REACT_URL = "http://localhost:3000/api/add-node"

def build_constellation_2me_node():
    """Creates a JSON representation of a Blackmagic Constellation 2 M/E switcher node."""
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    
    return {
        "id": f"constellation-2me-{timestamp}",
        "type": "switcher",
        "device_type": "Switcher",
        "manufacturer": "Blackmagic Design",
        "model": "ATEM Constellation 2 M/E",
        "color": "#0a1f44",  # dark blue / blackmagic brand color
        "position": {"x": 400, "y": 200},  # initial position on canvas
        "pins": [
            # 20 SDI inputs (simplified example — you can expand)
            {"id": "sdi-in-1",  "label": "SDI In 1",  "type": "input",  "spec": "12G-SDI"},
            {"id": "sdi-in-2",  "label": "SDI In 2",  "type": "input",  "spec": "12G-SDI"},
            # ... imagine inputs 3–20 ...
            
            # 12 SDI aux outputs
            {"id": "sdi-aux-out-1",  "label": "SDI Aux Out 1",  "type": "output",  "spec": "12G-SDI"},
            {"id": "sdi-aux-out-2",  "label": "SDI Aux Out 2",  "type": "output",  "spec": "12G-SDI"},
            # ... imagine outputs 3–12 ...
            
            # Control ports
            {"id": "ethernet-ctrl-1",  "label": "Control Ethernet 1",  "type": "control",  "spec": "1GBASE-T"},
            {"id": "ethernet-ctrl-2",  "label": "Control Ethernet 2",  "type": "control",  "spec": "1GBASE-T"},
            
            # Optional tally / reference ports, etc.
            {"id": "ref-in",  "label": "Reference Input",  "type": "input",  "spec": "Tri-Level / Black Burst"}
        ],
        "notes": "2 M/E live production switcher with 40×12 crosspoint, 4 DVEs, 8 ATEM Advanced Keyers, 2 multiviewers",
        "thumbnail": None  # can be base64 or URL later
    }

def send_node_to_react(node_data):
    print("\nNode ready! Paste this JavaScript into the browser console (F12 → Console tab) while the React app is open:\n")
    print("```js")
    print(f"window.postMessage({{")
    print(f"  type: 'add-node',")
    print(f"  payload: {json.dumps(node_data, indent=2)}")
    print("}, '*');")
    print("```")
    print("\nAfter pasting, the node should appear on the canvas.")
    try:
        print("Sending node to React server...")
        response = requests.post(
            REACT_URL,
            json=node_data,
            headers={"Content-Type": "application/json"},
            timeout=8
        )

        if response.status_code in (200, 201):
            print("Success! Node accepted by React.")
            try:
                print("Server response:", response.json())
            except:
                print("Response body:", response.text)
        else:
            print(f"Server rejected the request. Status: {response.status_code}")
            print("Response:", response.text)

    except requests.exceptions.ConnectionError:
        print("\nERROR: Cannot connect to React dev server.")
        print("Make sure the React frontend is running (npm run dev in frontend folder).")
        print(f"Expected URL: {REACT_URL}\n")
    except Exception as e:
        print(f"Unexpected error while sending: {e}")

if __name__ == "__main__":
    node = build_constellation_2me_node()
    
    print("Generated node JSON:")
    print(json.dumps(node, indent=2))
    print("\n" + "="*60 + "\n")
    
    send_node_to_react(node)