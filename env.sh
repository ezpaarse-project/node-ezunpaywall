export NODE_EZUNPAYWALL_URL="localhost"
export NODE_EZUNPAYWALL_PORT="8080"

if [[ -f env.local.sh ]] ; then
  source env.local.sh
fi