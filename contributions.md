# Contributions

Every member has to complete at least 2 meaningful tasks per week, where a
single development task should have a granularity of 0.5-1 day. The completed
tasks have to be shown in the weekly TA meetings. You have one "Joker" to miss
one weekly TA meeting and another "Joker" to once skip continuous progress over
the remaining weeks of the course. Please note that you cannot make up for
"missed" continuous progress, but you can "work ahead" by completing twice the
amount of work in one week to skip progress on a subsequent week without using
your "Joker". Please communicate your planning **ahead of time**.

Note: If a team member fails to show continuous progress after using their
Joker, they will individually fail the overall course (unless there is a valid
reason).

**You MUST**:

- Have two meaningful contributions per week.

**You CAN**:

- Have more than one commit per contribution.
- Have more than two contributions per week.
- Link issues to contributions descriptions for better traceability.

**You CANNOT**:

- Link the same commit more than once.
- Use a commit authored by another GitHub user.

---

## Contributions Week 1 - 23/03/2026 to 30/03/2026

| **Student**        | **Date** | **Link to Commit**                | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ----------------------------------| ------------------------------- | ----------------------------------- |
| Linu5Frick         |24.03.2026| [Commit1] ([text](https://github.com/yanke4/sopra-fs26-group-23-server/commit/fe1039c432a3965e334474213f13b33820dfe966)) | Implementation of UserController| UserController is the basic coordinator for the user activities |
|                    |26.03.2026| [Commit2] ([text](https://github.com/yanke4/sopra-fs26-group-23-server/commit/52e5e9bc917b84027edb9ad7d90ab04c071af4fb)) | Implemented the User Class #20| User Class is used for the entity and setters and getters |
|                    |26.03.2026| [Commit3] ([text](https://github.com/yanke4/sopra-fs26-group-23-server/commit/1809f3d5b63876efe6417d1258a208405a809f3d)) | Implemented the userService | The specific execution of the methods in UserController|
|                    |28.03.2026| [Commit4] ([text](https://github.com/yanke4/sopra-fs26-group-23-client/commit/80e630cbf57dbd89f26630b8bb0d47ac6159729e)) | Failure messages for login and register | So the user knows what's wrong when trying to login or register |
|                    |29.03.2026| [Commit5] ([text](https://github.com/yanke4/sopra-fs26-group-23-server/commit/249c8aef3a41ac5a2f5168d0d6bc97e86283f035)) | Authentication for login and logout #23 | For a user to login and then logout he needs to be authenticated, so that the login and logout happens from the same user |
|                    |29.03.2026| [Commit6] ([text](https://github.com/yanke4/sopra-fs26-group-23-server/commit/13182fc950b6c5cd29733648e5a9691dde966300))  | Removed email field in profile and register | We only want to use the username |
|                    |29.03.2026| [Commit7] ([text](https://github.com/yanke4/sopra-fs26-group-23-server/commit/5ab4737a907951ebb9b4b5affde86408be2dab60)) | Authentication for the registration | A person that registers for the first time needs to have a token to be able to logout |
|                    |29.03.2026| [Commmit8] ([text](https://github.com/yanke4/sopra-fs26-group-23-client/commit/31b54ee6e088b0a882c124d8e7091dcf0f5b4840)) | Authentication for profile and working logout button #20 | When the user wants to see his profile, he needs to be authenticated because there's also the updatePassword option|
| **devnida** | 24/03/2026   | [[Link to Commit 1]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/9ed5c55b772e8f86408d606a76eeb79386fd5379) | Homepage UI | The homepage is needed to start a lobby, get informations and to access the profile. |
|                    | 24/03/2026 | [[Link to Commit 2] ](https://github.com/yanke4/sopra-fs26-group-23-client/commit/9f2983c75635b8f81f456956145a2abff448b268)| Navbar UI| Add navbar to every page, which is useful to get to the relevant pages. |
|                    | 24/03/2026   | [[Link to Commit 3] ](https://github.com/yanke4/sopra-fs26-group-23-client/commit/af18884e033678aa3ce8617e8c37a70508bf9470)| User profile UI  | User can access to personal informations and change password. |
|                    | 28/03/2026   | [[Link to Commit 4] ](https://github.com/yanke4/sopra-fs26-group-23-client/commit/670eae16112f94611a06bd99d5ef43b664615dd7)| Fix responsiveness | Responsiveness is important so that the website looks good on every device.|
|                    | 29/03/2026   | [[Link to Commit 5]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/15b6212981a6c2c8b4328a7c64ed02821c5d25fd) | Login page UI | This page is relevant in order to allow users to login. |
|                    | 29/03/2026   | [[Link to Commit 6]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/0cbbb3a0267447e380edbe40544b0e54a48a28db) | Register page UI | This page is relevant in order to allow users to register. |
| **yanke4** | 28/03/2026  | [[Link to Commit 1]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/f0d1bfc2b23b80dd97c29c04a2a227865da5fed3) | Created WebSocket for Lobby | The WebSocket is needed in order for the lobby page to be updated automatically |
|                    | 28/03/2026   | [[Link to Commit 2]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/0f58da2e6e329ae82ad6bd44e409d0c2d0848f71) | Broadcast users in lobby | new users automatically show up in lobby page |
|                    | 29/03/2026   | [[Link to Commit 3]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/83dbaebb62c5e30f71e9ff5363f508077b5cfa66) | Fix join lobby | Users can properly join Lobby via code |
| **MatteoLozano** | 24.03.2026 | [[Link to Commit 1]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/abd053b58944844f517a61c4821217b9a55adcfc) | Set up general server structure (as BeliaL) | Initial establishment of the server-side directory structure and Spring Boot configurations. |
|                  | 25.03.2026 | [[Link to Commit 2]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/9d6c5c7beb4609c11cd0488ac98f04e3676cb983) | Implement Lobby class (as BeliaL) | Designed the primary Lobby entity for data persistence. |
|                  | 26.03.2026 | [[Link to Commit 3]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/99464c7e137aa35e11f5da45c4a08b3f340ca014) | Implement LobbyDTO objects (as BeliaL)| Created DTOs to safely expose lobby data to the client via the REST API. |
|                  | 28.03.2026 | [[Link to Commit 4]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/1ab133e08f8ee20335e9413244bec37e30865cd0) | Finish Lobby service logic | Commit to close the task. Actual logic done before. |
|                  | 30.03.2026 | [[Link to Commit 5]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/cf0b05167bef39a3066054687321fbaf4b853c5e) | Implement 6-digit PIN and host assignment #29 | Finalized unique PIN generation and automatic host assignment for session creators. |

---

## Contributions Week 2 - 30/03/2026 to 13/04/2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **yanke4** | 11/04/2026 | [[Link to Commit 1]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/c358684adf29f7ca88a94807246cc48db5f6cfe2) | Attack validation | User can only attack adjacent fields |
|                    | 11/04/2026   | [[Link to Commit 2]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/382df9d05216719e5b5ca0053d7571d89e99c847) | Attack outcome | attack is simulated with multiple dice roll until winner is decided |
|                    | 11/04/2026 | [[Link to Commit 3]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/d0f17eb48fbbbc9114c9d8f9dfa3aeeac13aac32) | field ownership transfer | upon successfull attack the field gets a new owner |
|                    | 13/04/2026   | [[Link to Commit 4]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/4011010509eb65e069e2abea1d05776522b6d788) | websocket update after each attack | outcome of attack gets displayed for all users |
| **Linus5Frick** | 08/04/2026   | [[Link to Commit 1]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/0354d793b375135f044ec3fbcccdf5eee0b4c5e5) | Implement the map entitiy | Basis of use of map helper functions |
|                    | 08/04/2026   | [[Link to Commit 2]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/f0ccc39c7ba35694008dfdc6bffd7fccbae43cf2) | Start of map, region and turn class | Again the basis for the use of map, regions and the turns |
|                    | 09/04/2026   | [[Link to Commit 3]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/4ba438156c775de3aff9a1aa714ae4f8d0a7d654) | Implemented the Field and Region entities | Again the basis for the use of regions and the fields |
|                    | 09/04/2026   | [[Link to Commit 4]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/37e25649ecb262f371fea7d7813437a198e09c82) | Implemented the GameRepository and FieldService  | Methods to use in Order to execute all field and game related functions |
|                    | 09/04/2026   | [[Link to Commit 5]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/a6e3a43a1e4545a74341ecdf8589e3c267914997) | Implemented the Regionbonus and field count | Players concurring a region get Bonus points and for that we need to know how many and which fields belong to which player |
|                    | 12/04/2026   | [[Link to Commit 6]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/750635190e6f7f6abed11cb27847404068a2f488) | Implemented the calculationOfTroops including BonusAmount| Every turn each player gets a certain amount of troops based on how many fields and regions the player owns|
|                    | 12/04/2026   | [[Link to Commit 7]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/6e87e62e5b04fdb199901721174737cc163a9a44) | Implemented the check, whether the fields are owned by the active player | Players can only deploy or move troops inbetween fields the already own|
| **devnida** | 08/04/2026   | [[Link to Commit 1]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/70856c3111f411aefd2439379bc195db260647ee) | Setup of map component | UI component where the game takes place. |
|                    | 09/04/2026   | [[Link to Commit 2]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/9284eb0b5635d5e4c98231ab1f79d0efff8f6932) | Implementation of map component | UI component where the game takes place. |
|                    | 09/04/2026   | [[Link to Commit 3]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/75ad676b6d207efd2d7fbf3e1624e319c8d7647e) | Add troops count to UI | Players can now see available troops during the game. |
|                    | 09/04/2026  | [[Link to Commit 4]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/be5aec934040fee79a1cf37ae0b104100f84ae3e) | Implement start game logic | Add checks necessary before the game starts. |
|                    | 09/04/2026   | [[Link to Commit 5] ](https://github.com/yanke4/sopra-fs26-group-23-server/commit/9527211d42b61014f19c4bc82e67d04f31109463)| Add regions & neighbors to the backend. Also implemented territory assignment and troops allocations at the start of the game.  | Added necessary field data to the backend and first troops/territory assignments to players.    |
| **[@MatteoLozano]** | [07/04/2026]   | [[Link to Commit 1]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/59e3632581e7dfdb140b67493760aa8084af3a8c) | Implement Player Class | Important for differenciating User data and player data |
|                    | [09/04/2026]   | [[Link to Commit 2]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/b566d2ed3b4a4a5db5e46b7f9a57440f22768fb7) | Implement turn flow logic with deploy, attack and move phases. | The server needs to respond correctly when the client calls the different actions and calculate the outcomes. |
| | [12/04/2026] | [[Link to Commit 3]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/958c32f1bfeb86c396ce77e49f0f9f31854a6176) | Implement TurnController | Exposes dedicated deploy, attack, and move endpoints so client turn actions are routed correctly to backend. |
| | [12/04/2026] | [[Link to Commit 4]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/7146c1eecf4795ac1204a4abdf0c4839961cb742) | Broadcast game start and update game logic | Adds structured game-state DTOs and websocket broadcasts so all players receive synchronized start and turn-state updates in real time. |
| | [12/04/2026] | [[Link to Commit 5]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/5225df8a8ba4bc9bae09a3b68aec80ec1261b57b) | Close issues #38 and #42 after integration verification | Mark previously implemented game-start broadcast and troop-count updates as completed. |

---

## Contributions Week 3 - 13/04/2026 to 20/04/2026

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **yanke4** | 15/04/2026 | [[Link to Commit 1]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/27a17ddcbabe84d957cdc74179c5fcfe07e35ed2) | fixed lobby bugs | lobby now works as intended |
|                    | 16/04/2026 | [[Link to Commit 2]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/a4a292dfe3ce0d4cbb445a8d91ce02f3fb1e9ef4) | implemented troop movement validation | troops can only move if territories are connected |
|                    | 16/04/2026 | [[Link to Commit 3]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/5e60522065274ae717d7b7d5873af4c4ae76af4f) | enforced 1 movement per turn | player can only move once per turn |
|                    | 17/04/2026 | [[Link to Commit 4]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/534cbb0162ff246d57f1f32e385dbafe1e031c4a) | implemented surrender logic | players can surrender |
|                    | 18/04/2026 | [[Link to Commit 5]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/109d1bc31c871d0515e3cc1d6ffa0600a5db99ed) | implemented win condition check | game can end |
|                    | 18/04/2026 | [[Link to Commit 6]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/296e5869c8645e1789c8e7e6a54e3ca966afedfc) | added surrender button | player can surrender now |
|                    | 19/04/2026 | [[Link to Commit 7]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/845fee5c1cb3fb9bde9073e4c57b4ff0e4fb9846) | surrender notification | players see when someone surrenders |
| **devnida** | 14/04/2026  | [[Link to Commit 1]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/a60bd758b0678f876a10dd4b8eb78cbde8f47d8c) | Load map | Load map with initial informations about players and assigned territories  |
|                    | 15/04/2026   | [[Link to Commit 2]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/31760b62b98b8c2f9294344c672061488a6215b1) | Attack phase UI | Players can see which territories can be attacked from a starting position |
|                    | 15/04/2026   | [[Link to Commit 3]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/ff27234446ed7bfe22184607dd2df3c649542f31) | Turn rotation logic | Implement turn rotation that handles the rotation of turns between players |
|                    | 16/04/2026   | [[Link to Commit 4]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/45cf9517320b3236d6cc8d428cc51860cfa1734b) | Victory screen UI | Implement victory screen UI which is shown to the players at the end of the game |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@MatteoLozano]** | [18/04/2026]   | [[Link to Commit 1]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/291822c77eefe193ac1bada635dc3910abbc4dc6) | [Deployment UI and logic. Display deployment outcome for everybody in client ] | [Ensures deployment is correctly processed on the client and synchronizes deployment outcomes for all players.] |
|                    | [18/04/2026]   | [[Link to Commit 2]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/d2553a32e148286d1dbebca5d1a6bcc0a21f6c0e) | [Implement attack and movement UI and display outcome for everybody] | [Enables complete attack/movement interactions in the UI and keeps all players synchronized with shared outcomes.] |
| **Linus5Frick** | 17/04/2026   | [[Link to Commit 1]][text](https://github.com/yanke4/sopra-fs26-group-23-client/commit/84ee5606882ea0ee9935fc4a223c18231eaee799) | Implemented the GameChat UI in the game page #30 | The GameChat is visible in the game site |
|                    | 18/04/2026   | [[Link to Commit 2]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/dba64b84a58caf47d9f95bf8cfdbc663fdc83eff) | Implemented everything needed for the Chat API in the frontend | Implemented the basis for the use of the API |
|                    | 18/04/2026   | [[Link to Commit 3]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/ba5c34a51d254ec07aafb6e9913758f02516b6c1) | add GameChat component to game page #64 and #65| Needed the GameChat for the sending of messages  |
|                    | 18/04/2026   | [[Link to Commit 4]](https://github.com/yanke4/sopra-fs26-group-23-client/commit/9f725ddf9702e7e87363400aea16e5021ddb14e7) | Adjustments and additions for the GameChat to work. Color of Player and multiple message fix. #64 and #65  | Now the users have the same colour as in the game and messages arent sent multiple times |
|                    | 18/04/2026   | [[Link to Commit 5]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/744ce69e760c2a338cb28f95556b1c120bc0b94e) | Implemented the backend of the Chat| In order for the chat to work with the API the implementation of ChatController and MessageDTO |
|                    | 18/04/2026   | [[Link to Commit 6]](https://github.com/yanke4/sopra-fs26-group-23-server/commit/33d92ae7c8a93ec4e010296a711213d1a7c0a4d5) | Changed the implementation of the attack method, so that the calculation of the remaining troops is correct.
| Whenever a player attacks another field now the right amount of troops is taken away|


---

## Contributions Week 4 - [Begin Date] to [End Date]

| **Student**        | **Date** | **Link to Commit** | **Description**                 | **Relevance**                       |
| ------------------ | -------- | ------------------ | ------------------------------- | ----------------------------------- |
| **[@githubUser1]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser2]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser3]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |
| **[@githubUser4]** | [date]   | [Link to Commit 1] | [Brief description of the task] | [Why this contribution is relevant] |
|                    | [date]   | [Link to Commit 2] | [Brief description of the task] | [Why this contribution is relevant] |

---

## Contributions Week 5 - [Begin Date] to [End Date]

_Continue with the same table format as above._

---

## Contributions Week 6 - [Begin Date] to [End Date]

_Continue with the same table format as above._
