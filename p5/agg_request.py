import requests
import json

url = 'http://ec2-54-183-187-18.us-west-1.compute.amazonaws.com:5000/eeg'
def get_total_focused():
	total = 0
	num_lines = 0
	with open('out3.txt') as f:
		for line in f:
			total += float(line)
			num_lines += 1

	return total/num_lines


def agg():
	total = 0
	num_lines = 0
	with open('out2.txt') as f:
		for line in f:
			total += float(line)
			num_lines += 1

	
	total_mellow = total/num_lines
	total_focused = get_total_focused()
	print(total_mellow)
	r = requests.post(url, data=json.dumps({"Body": {"mellow": total_mellow, "focused": total_focused}}), headers={'Content-Type': 'application/json'})

if __name__ == '__main__':
	agg()
