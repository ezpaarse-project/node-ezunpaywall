export NODE_EZPAYWALL_URL="localhost"
export NODE_EZPAYWALL_PORT="8080"

if [[ -f env.local.sh ]] ; then
  source env.local.sh
fi