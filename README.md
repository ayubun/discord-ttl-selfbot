# Undiscord CLI

A CLI adaptation of [victornpb/undiscord][undiscord], with many quality-of-life changes and bugfixes, such as:

- Support for thread auto-unarchiving
- Support for deleting self-made Discord polls
- Support for full-account deletion (omitting --guild-ids and --channel-ids will delete from all guilds and DMs)
  - DMs can be excluded via --exclude-dms
  - DMs can be specifically requested via --guild-id @me
- Support for guild batching (supplying multiple --guild-ids will run batch jobs)
- Support for supplying custom request headers
- Fix batch jobs not having search delays in between
- Fix searchDelay is NaN for ratelimiting logic
- Fix missing search perms from stopping the entire batch job
  - This can happen if a guild that you are in has no visible channels
- Proper retry logic & error handling for undeletable messages

---

To get started, install dependencies:
```bash
npm install
```

Then, run the CLI:
```bash
node ./src/cli.js --help
```

---

The Undiscord CLI provides you with the ability to supply custom request headers. If you are an advanced user, it is recommended to set at least `Cookie`, `User-Agent`, and `X-Super-Properties`. The `--custom-headers` field will be appended to all requests made via the CLI:

```bash
node ./src/cli.sj --custom-headers '{"Cookie":"COOKIE HERE","User-Agent":"USER AGENT HERE","X-Super-Properties":"X SUPER PROPERTIES HERE"}' (... remaining options)
```

To get appropriate values for these headers, you can access the Developer Options (Cmd+Option+I for Mac, Ctrl+Shift+I for Windows) -> `Network` tab in on Discord Canary or via a web browser and make a request (such as searching for messages). Clicking on the request and selecting `Headers` will show a list of the headers that were used.
*Note: Developer Options is disabled on the regular Discord app. You will need to use Discord Canary or a web browser to open this panel.*

---

**Any tool that automates actions on user accounts, including this one, could result in account termination.** (see [self-bots][self-bots]).  
Use at your own risk! ([discussion](https://github.com/victornpb/undiscord/discussions/273)).

If you want a message deletion service that uses Discord bots instead of user accounts, see [ayubun/discord-ttl][discord-ttl]


---
#### DISCLAIMER

> THE SOFTWARE AND ALL INFORMATION HERE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
>
> By using any code or information provided here you are agreeing to all parts of the above Disclaimer.


<!-- links -->
  [undiscord]: https://github.com/victornpb/undiscord
  [self-bots]: https://support.discordapp.com/hc/en-us/articles/115002192352-Automated-user-accounts-self-bots-
  [discord-ttl]: https://github.com/ayubun/discord-ttl

