import { useEffect, useState } from 'react';
import example_json from './assets/example_json';
import AllStatsPlayer from './types/AllStatsPlayer';
import ModifiedStatsPlayer from './types/ModifiedStatsPlayer';
import UserAnswers from './types/UserAnswers';
import extractAllStats from './utils/extractAllStats';
import createRemovedStatsPlayers from './utils/createRemovedStatsPlayers';
import updateUserAnswers from './utils/updateUserAnswers';
import checkUserAnswers from './utils/checkUserAnswers';
import QuizField from './components/QuizField';
import { cloneDeep } from 'lodash';
import getOriginalStatRemove from './utils/getOriginalStatRemove';
import QuizHeader from './components/QuizHeader';
import getDataFromLocalStorage from './utils/getDataFromLocalStorage';
import setDataToLocalStorage from './utils/setDataToLocalStorage';
import * as Progress from '@radix-ui/react-progress';
import './ProgressBar.css';
import calcEmptyFields from './utils/calcEmptyFields';
import updateProgressBar from './utils/updateProgressBar';

function App() {
  const [allStatsPlayers, setallStatsPlayers] = useState<AllStatsPlayer[]>([]);
  const [statsRemove, setStatsRemove] = useState<ModifiedStatsPlayer[]>([]);
  const [originalStatsRemove, setOriginalStatRemove] = useState<
    ModifiedStatsPlayer[]
  >([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [progressBar, setProgressBar] = useState(0);

  const localStorageKeys = {
    allStatsPlayers: 'allStatsPlayers',
    removedStatsPlayers: 'removedStatsPlayers',
    originalStatRemove: 'originalStatRemove',
  };

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    const userAnswers = updateUserAnswers(e);
    setUserAnswers(userAnswers);
  }

  function handleCheckAnswers() {
    const updateRemovedStats = checkUserAnswers(
      allStatsPlayers,
      statsRemove,
      userAnswers
    );
    setStatsRemove(updateRemovedStats);
    console.log(updateRemovedStats);
    localStorage.setItem(
      'removedStatsPlayers',
      JSON.stringify(updateRemovedStats)
    );
  }

  useEffect(() => {
    // if user submits answers
    if (Object.keys(userAnswers).length > 0) {
      handleCheckAnswers();
    }
    console.log(userAnswers);
  }, [userAnswers]);

  /* Run using API --------------------------------------------------------------------------------- */

  // useEffect(() => {
  //   const getData = async () => {
  //     const options = {
  //       method: 'GET',
  //       headers: {
  //         'x-rapidapi-key': import.meta.env.VITE_API_KEY,
  //       },
  //     };

  //     const season = 2016;
  //     const response = await fetch(
  //       `https://v3.football.api-sports.io/players/topscorers?league=39&season=${season}`,
  //       options
  //     );

  //     const body = await response.text();
  //     const data = JSON.parse(body);

  //     console.log(data);

  //     const allStatsPlayer: AllStatsPlayer[] = data['response'].map(
  //       // player array
  //       (el: PlayerStats, index: number) => {
  //         const playerMap = new Map();
  //         return playerMap.set(el.player.id, {
  //           name: removeAbbrevName(el.player.name),
  //           firstname: el.player.firstname,
  //           lastname: el.player.lastname,
  //           nationality: el.player.nationality,
  //           team: el.statistics[0].team.name,
  //           ranking: index + 1, // index object comes in order, so use index to calculate ranking
  //           goals: el.statistics[0].goals.total,
  //         });
  //       }
  //     );

  //     console.log(allStatsPlayer);

  //     setallStatsPlayers(allStatsPlayer);
  //     // Maps are not valid JSON, so convert each map into object first before stringifying
  //     const stringifiedMap = JSON.stringify(
  //       allStatsPlayers.map((map) => Object.fromEntries(map))
  //     );
  //     localStorage.setItem('allStatsPlayers', JSON.stringify(stringifiedMap));
  //   };
  //   // getData();
  // }, []);

  /* Run using API ^^^-------------------------------------------------------------------------------*/

  /* Run using local data -------------------------------------------------------------------------- */

  const allStatsPlayersVar: AllStatsPlayer[] = extractAllStats(
    example_json['response']
  );
  console.log(allStatsPlayersVar);

  useEffect(() => {
    console.log('browser refresh');

    // allStatPlayers
    const storedAllStatsPlayers: AllStatsPlayer[] | null =
      getDataFromLocalStorage(localStorageKeys.allStatsPlayers);
    if (storedAllStatsPlayers) {
      console.log('Extract data from storedAllStatsPlayer local storage');
      setallStatsPlayers(storedAllStatsPlayers);
    } else {
      console.log('Set initial state for allStatsPlayers');
      setallStatsPlayers(allStatsPlayersVar);
      setDataToLocalStorage(
        localStorageKeys.allStatsPlayers,
        allStatsPlayersVar
      );
    }

    // removedStatPlayers
    const storedRemovedStatsPlayers: ModifiedStatsPlayer[] | null =
      getDataFromLocalStorage(localStorageKeys.removedStatsPlayers);
    if (storedRemovedStatsPlayers) {
      console.log('Extract data from removedStatsPlayers local storage');
      console.log(storedRemovedStatsPlayers);
      setStatsRemove(storedRemovedStatsPlayers);
    } else {
      console.log('Set initial state for removedStatPlayers');
      const removedStatsPlayers = createRemovedStatsPlayers(allStatsPlayersVar);
      setStatsRemove(removedStatsPlayers);
      setDataToLocalStorage(
        localStorageKeys.removedStatsPlayers,
        removedStatsPlayers
      );
    }

    // originalStatPlayers
    const storedOriginalStatRemove: ModifiedStatsPlayer[] | null =
      getDataFromLocalStorage(localStorageKeys.originalStatRemove);
    console.log(storedOriginalStatRemove);
    if (storedOriginalStatRemove) {
      console.log('Original stats extracted from local storage');
      setOriginalStatRemove(storedOriginalStatRemove);
    }
  }, []);

  useEffect(() => {
    console.log(statsRemove);
    const storedOriginalStatRemove: ModifiedStatsPlayer[] | null =
      getDataFromLocalStorage(localStorageKeys.originalStatRemove);

    // if original is already set, don't set it again
    if (storedOriginalStatRemove === null) {
      console.log('No original stats present, set for first time');
      const originalStatRemoveClone = cloneDeep(statsRemove);
      setOriginalStatRemove(originalStatRemoveClone);
      setDataToLocalStorage(
        localStorageKeys.originalStatRemove,
        originalStatRemoveClone
      );
    }

    // Update Progress bar
    updateProgressBar(statsRemove, originalStatsRemove, setProgressBar);
  }, [statsRemove]);

  /* Run using local data ^^^ -------------------------------------------------------------------------- */

  return (
    <div className='App'>
      <div className='bg-red-600 flex-col w-fit'>
        <QuizHeader />
        <form onSubmit={handleFormSubmit}>
          {statsRemove.map((player: ModifiedStatsPlayer) => {
            console.log(player);
            const currentPlayerStats = Object.entries(player)[0];
            const [id, stats] = Object.entries(player)[0];
            console.log(id);
            console.log(stats);
            const originalStats = getOriginalStatRemove(
              originalStatsRemove,
              id
            ); // use weird reduce method to get the stats object out of object using id

            return (
              <div key={id.toString()} className='flex'>
                <div className='text-center w-16 p-1'>{stats.ranking}</div>
                <QuizField
                  currentPlayerStats={currentPlayerStats}
                  originalStats={originalStats}
                  statsKey={'name'}
                />
                <QuizField
                  currentPlayerStats={currentPlayerStats}
                  originalStats={originalStats}
                  statsKey={'nationality'}
                />
                <QuizField
                  currentPlayerStats={currentPlayerStats}
                  originalStats={originalStats}
                  statsKey={'team'}
                />
                <div className='text-center w-16 p-1'>{stats.goals}</div>
              </div>
            );
          })}
          <div className='flex justify-center p-2'>
            <button type='submit'>Submit</button>
          </div>
        </form>
        <div className='bg-cyan-100 flex justify-center gap-4 py-4'>
          <Progress.Root className='ProgressRoot' value={progressBar}>
            <Progress.Indicator
              className='ProgressIndicator'
              style={{ transform: `translateX(-${100 - progressBar}%)` }}
            />
          </Progress.Root>
          <p>{progressBar ? progressBar : 0}%</p>
        </div>
      </div>
    </div>
  );
}
export default App;
