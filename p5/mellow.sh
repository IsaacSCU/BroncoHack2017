muse-player -l tcp:5000 -D >out.txt & sleep 8; kill $!
cat out.txt
cat out.txt | grep 'mellow' | sed 's/^.*mellow f  //' >out2.txt

cat out.txt | grep 'concentration' | sed 's/^.*concentration f  //' >out3.txt
