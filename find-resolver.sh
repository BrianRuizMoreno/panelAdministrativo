#!/bin/bash
docker service inspect $(docker service ls -q) --format '{{range $k, $v := .Spec.Labels}}{{if printf "%s" $k | match "certresolver"}}{{$v}}{{end}}{{end}}' 2>/dev/null | grep -v '^$' | head -1
