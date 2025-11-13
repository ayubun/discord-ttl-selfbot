# Undiscord CLI

A CLI adaptation of [victornpb/undiscord][undiscord], with many quality-of-life changes and bugfixes, such as:

- Support for thread auto-unarchiving
- Support for deleting self-made Discord polls
- Support for full-account deletion (omitting --guild-ids and --channel-ids will delete from all guilds and DMs)
  - DMs can be excluded via --exclude-dms
  - DMs can be specifically requested via --guild-id @me
- Support for guild batching (supplying multiple --guild-ids will run batch jobs)
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

**Any tool that automates actions on user accounts, including this one, could result in account termination.** (see [self-bots][self-bots]).  
Use at your own risk! ([discussion](https://github.com/victornpb/undiscord/discussions/273)).

If you want a message deletion service that uses Discord bots instead of user accounts, see [ayubun/discord-ttl][discord-ttl]


----
#### DISCLAIMER

> THE SOFTWARE AND ALL INFORMATION HERE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
>
> By using any code or information provided here you are agreeing to all parts of the above Disclaimer.


<!-- links -->
  [undiscord]: https://github.com/victornpb/undiscord
  [self-bots]: https://support.discordapp.com/hc/en-us/articles/115002192352-Automated-user-accounts-self-bots-
  [discord-ttl]: https://github.com/ayubun/discord-ttl

