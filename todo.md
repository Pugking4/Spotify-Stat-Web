# TODO
### *Order of implementation is top to bottom

## *Current planned features
* Add API stats calculation to API
* API stats page for api stats
* Replace grey card background in recently played
  * Create new background from either:
    * Expanded cover art to fill whole card
    * Choose top 4 used colours and create gradient/texture with it
  * Background should be translucent/blurred to keep focus on stats/text
* Stats page which show a ton of diagrams and stats
* Add API testing
* Add Web testing
* Create rate limit manager in Tracker to ensure smooth operation

## Maybe future
* Accounts system, works with multiple accounts not just my own
  * Global leaderboard
  * Local/Group leaderboard where you can compare stats with friends you add
  * Will need to perform rate limit testing to find cap
* Search through database of songs to see song/album/artist profile
  * Will show how many times played, when played (timeline style)
  * Will need to implement fuzzy search