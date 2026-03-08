"""Print all routes and their dependencies to debug the 401."""
import sys
sys.path.insert(0, '.')

from app.main import app

for route in app.routes:
    if hasattr(route, 'methods'):
        deps = [str(d) for d in getattr(route, 'dependencies', [])]
        print(f"{route.methods} {route.path}  deps={deps}")
