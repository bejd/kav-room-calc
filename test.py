import json
import sys

dim_x = float(sys.argv[1])
dim_y = float(sys.argv[2])
dim_z = float(sys.argv[3])
material = sys.argv[4]

data = {}


area = dim_x * dim_y
volume = dim_x * dim_y * dim_z


data["area"] = area
data["volume"] = volume
data["arbitrary_value"] = "foo"
data["material"] = material

data["capacity"] = (dim_x - 1) * (dim_z - 2)
data["viewer_dist_min"] = 1.2
data["viewer_dist_max"] = dim_z - 1


print(json.dumps(data))
