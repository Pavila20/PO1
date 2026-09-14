Import("env")
import os

# Loads WiFi credentials for the ENV_HOME_SSID / ENV_HOME_PASSWORD /
# ENV_SCHOOL_SSID / ENV_SCHOOL_PASSWORD macros used by main.cpp.
#
# This reads PO1_Hardware/.env directly, so it works no matter how the build
# is triggered - a terminal `pio run`, flash.ps1, or VS Code's own PlatformIO
# Upload/Monitor buttons all go through this same extra_scripts hook. A real
# OS environment variable (if set) still takes precedence, so flash.ps1
# continues to work exactly as before.


def load_dotenv(path):
    values = {}
    if os.path.isfile(path):
        with open(path, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                values[key.strip()] = value.strip()
    return values


dotenv_values = load_dotenv(os.path.join(env["PROJECT_DIR"], ".env"))


def get(key):
    return os.environ.get(key) or dotenv_values.get(key, "")


try:
    stringify = env.StringifyMacro
except AttributeError:
    def stringify(value):
        escaped = value.replace("\\", "\\\\").replace('"', '\\"')
        return '\\"%s\\"' % escaped

env.Append(CPPDEFINES=[
    ("ENV_HOME_SSID", stringify(get("HOME_SSID"))),
    ("ENV_HOME_PASSWORD", stringify(get("HOME_PASSWORD"))),
    ("ENV_SCHOOL_SSID", stringify(get("SCHOOL_SSID"))),
    ("ENV_SCHOOL_PASSWORD", stringify(get("SCHOOL_PASSWORD"))),
])

print("[load_wifi_env] HOME_SSID=%r SCHOOL_SSID=%r" % (get("HOME_SSID"), get("SCHOOL_SSID")))
