"use client";

import EuropeMap from "@/components/europe-map";
import VictoryScreen from "@/components/victory-screen";
import GameTopBar from "./GameTopBar";
import PlayerSidebar from "./PlayerSidebar";
import {
  SurrenderModal,
  SurrenderToast,
  TurnTimeoutPopup,
} from "./SurrenderOverlays";
import TerritoryAndChatPanel from "./TerritoryAndChatPanel";
import TurnTimerBar from "./TurnTimerBar";
import type { GamePageController } from "./useGamePageController";
import { YourTurnToast, PhaseTransitionToast } from "./YourTurnOverlay";
import { COLOR_MAP } from "./gameData";

const GameView = ({
  gameId,
  selectedTerritory,
  inspectedTerritory,
  targetTerritory,
  deployTroops,
  setDeployTroops,
  attackTroops,
  setAttackTroops,
  fortifyTroops,
  setFortifyTroops,
  surrenderMessage,
  showSurrenderModal,
  showYourTurnToast,
  showAttackPhaseToast,
  showFortifyPhaseToast,
  setShowSurrenderModal,
  turnTimeoutPopup,
  setTurnTimeoutPopup,
  attackAnimation,
  fortifyAnimation,
  deployAnimation,
  userId,
  gameState,
  troopHistory,
  myPlayerId,
  currentUser,
  currentPhase,
  isMyTurn,
  currentTurn,
  phaseIndex,
  playerStats,
  currentPlayer,
  territories,
  mapColors,
  myRegionBonus,
  myOwnedRegions,
  myMission,
  reinforcements,
  canDeployToSelected,
  validTargets,
  maxAttackTroops,
  maxFortifyTroops,
  hasAttackSelection,
  canAttackSelectedTarget,
  hasFortifySelection,
  canFortifySelectedTarget,
  inspectedInfo,
  targetInfo,
  handleTerritoryClick,
  handleDeploy,
  handleAttack,
  handleFortify,
  handleSurrender,
  handleConfirmSurrender,
  nextPhase,
}: GamePageController) => (
  <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden select-none bg-[#0a0908]">
    <SurrenderToast message={surrenderMessage} />
    <YourTurnToast show={showYourTurnToast} />
    <PhaseTransitionToast show={showAttackPhaseToast} phase="attack" />
    <PhaseTransitionToast show={showFortifyPhaseToast} phase="fortify" />
    <TurnTimeoutPopup
      show={turnTimeoutPopup}
      onClose={() => setTurnTimeoutPopup(false)}
    />
    {showSurrenderModal && (
      <SurrenderModal
        onCancel={() => setShowSurrenderModal(false)}
        onConfirm={handleConfirmSurrender}
      />
    )}

    <GameTopBar
      currentTurn={currentTurn}
      playerStats={playerStats}
      currentPlayer={currentPlayer}
      currentPhase={currentPhase}
      phaseIndex={phaseIndex}
      isMyTurn={isMyTurn}
      reinforcements={reinforcements}
      myPlayerId={myPlayerId}
      onNextPhase={nextPhase}
      onSurrender={handleSurrender}
    />

    <TurnTimerBar
      turnStartedAtMillis={gameState?.turnStartedAtMillis}
      turnTimerSeconds={gameState?.turnTimerSeconds}
      accentColor={
        COLOR_MAP[
          gameState?.players.find(
            (p) => p.playerId === gameState?.currentPlayerId,
          )?.color ?? "RED"
        ] ?? "#FFD900"
      }
    />

    <div className="flex flex-1 overflow-hidden">
      <PlayerSidebar
        playerStats={playerStats}
        currentPlayer={currentPlayer}
        myRegionBonus={myRegionBonus}
        myOwnedRegions={myOwnedRegions}
        myMission={myMission}
        currentTurn={currentTurn}
        currentPhase={currentPhase}
        isMyTurn={isMyTurn}
        reinforcements={reinforcements}
        canDeployToSelected={canDeployToSelected}
        selectedTerritory={selectedTerritory}
        targetTerritory={targetTerritory}
        deployTroops={deployTroops}
        setDeployTroops={setDeployTroops}
        attackTroops={attackTroops}
        setAttackTroops={setAttackTroops}
        fortifyTroops={fortifyTroops}
        setFortifyTroops={setFortifyTroops}
        maxAttackTroops={maxAttackTroops}
        maxFortifyTroops={maxFortifyTroops}
        hasAttackSelection={hasAttackSelection}
        canAttackSelectedTarget={canAttackSelectedTarget}
        hasFortifySelection={hasFortifySelection}
        canFortifySelectedTarget={canFortifySelectedTarget}
        onDeploy={handleDeploy}
        onAttack={handleAttack}
        onFortify={handleFortify}
      />

      <div className="flex-1 relative overflow-hidden">
        <EuropeMap
          territories={territories}
          playerColors={mapColors}
          selectedTerritory={selectedTerritory}
          inspectedTerritory={inspectedTerritory}
          targetTerritory={targetTerritory}
          onTerritoryClick={handleTerritoryClick}
          validTargets={validTargets}
          attackAnimation={currentPhase === "Attack" ? attackAnimation : null}
          fortifyAnimation={fortifyAnimation}
          deployAnimation={deployAnimation}
        />
      </div>

      <TerritoryAndChatPanel
        gameId={gameId}
        myPlayerId={myPlayerId}
        currentUser={currentUser}
        inspectedInfo={inspectedInfo}
        inspectedTerritory={inspectedTerritory}
        targetInfo={targetInfo}
        targetTerritory={targetTerritory}
        mapColors={mapColors}
        playerStats={playerStats}
      />
    </div>

    {gameState?.status === "FINISHED" && (
      <VictoryScreen
        gameState={gameState}
        currentUserId={userId}
        troopHistory={troopHistory}
      />
    )}
  </div>
);

export default GameView;
