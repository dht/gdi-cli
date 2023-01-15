# shortcuts: port
# desc: kills a port
echo "kill $1"
kill -2 $(lsof -t -i :$1)
