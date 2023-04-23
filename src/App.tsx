import { ReactEventHandler, useEffect, useState } from 'react';
import example_json from './assets/example_json';
import PlayerStats from './types/PlayerStats';
// import Player from './types/Player';
import QuizPlayer from './types/QuizPlayer';
import removeAbbrevName from './utils/removeAbbrevName';
import randomStatRemove from './utils/randomStatRemove';
import UserAnswers from './types/UserAnswers';
import { cloneDeep } from 'lodash';

function App() {
  const [scorers, setScorers] = useState<any>([]);
  const [statRemove, setStatRemove] = useState<any>([]);
  const [userAnswers, setUserAnswers] = useState<Map<any, any>>(new Map());

  useEffect(() => {
    const getData = async () => {
      var options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': import.meta.env.VITE_API_KEY,
        },
      };

      const season = 2016;
      const response = await fetch(
        `https://v3.football.api-sports.io/players/topscorers?league=39&season=${season}`,
        options
      );

      const body = await response.text();
      const data = JSON.parse(body);
      // console.log(data);
    };
    // getData();
  }, []);

  let allPlayers: any[] = example_json['response'].map( // player array
    (el: PlayerStats, index: number) => {
      const playerMap = new Map();
      return playerMap.set(el.player.id, {
        name: removeAbbrevName(el.player.name),
        firstname: el.player.firstname,
        lastname: el.player.lastname,
        nationality: el.player.nationality,
        team: el.statistics[0].team.name,
        ranking: index + 1, // index object comes in order, so use index to calculate ranking
        goals: el.statistics[0].goals.total,
      });
    }
  );

  console.log(allPlayers);

  useEffect(() => {
    setScorers(allPlayers);
    localStorage.setItem('players', JSON.stringify(allPlayers));
  }, []);

  function statRemover(players: any[]) {
    const playersClone: any[] = cloneDeep(players)
    
    const quizPlayers: any[] = playersClone.map((el) => {
      const keyIterator = el.keys()
      const key = keyIterator.next().value
      console.log(key);

      const statsToRemove = ['nationality', 'team', 'goals'];
      const randomIndex = Math.floor(Math.random() * 3);
      const randomKey = statsToRemove[randomIndex];

      el.get(key)[randomKey] = typeof el.get(key)[randomKey] === 'string' ? '' : 0;
      el.get(key).name = ''; // always remove name
      return el;
    });
    return quizPlayers;
  }

  const quizPlayers = statRemover(allPlayers);

  console.log(quizPlayers);
  console.log(allPlayers);

  function handleSubmit(e: any) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const userAnswersMap = new Map();

    for (const [nameId, value] of formData.entries()) {
      console.log(nameId, value);
      const [name, id] = nameId.split('-');
      console.log(Number(id), name, value);

      if (!userAnswersMap.has(Number(id))) {
        userAnswersMap.set(Number(id), {
          [name]: value,
        });
      } else {
        const answerObject = userAnswersMap.get(Number(id));
        const updatedAnswerObject = {
          ...answerObject,
          [name]: value,
        };
        userAnswersMap.set(Number(id), updatedAnswerObject);
      }
    }

    console.log(userAnswersMap);
    setUserAnswers(userAnswersMap);
    checkAnswers();
  }

  function checkAnswers() {
    console.log(scorers);
    const statRemoveClone = [...statRemove];
    console.log(statRemoveClone);

    for (let player of statRemoveClone) {
      const keyIterator = player.keys()
      const key = Number(keyIterator.next().value)
      console.log(key);
      console.log(player.get(key));
      console.log(userAnswers.get(key));
      console.log(scorers);

      const scorersCheck = scorers.reduce((acc: any, item: any) => {
        if (item.get(key)) {
          acc = item.get(key)
        }
        return acc
      }, null )

      console.log(userAnswers.get(key).nationality);
      console.log(userAnswers.get(key).team);
      console.log(userAnswers.get(key).goals);

      if (userAnswers.get(key).nationality) {
        console.log('found nationality');
        if (scorersCheck.nationality === userAnswers.get(key).nationality) {
          console.log('match');
          player.get(key).nationality = userAnswers.get(key).nationality; 
        }
      }

      if (userAnswers.get(key).team) {
        console.log('found team');
        if (scorersCheck.team === userAnswers.get(key).team) {
          console.log('match');
          player.get(key).team = userAnswers.get(key).team; 
        }
      }

      if (userAnswers.get(key).goals) {
        console.log('found goals');
        if (scorersCheck.team === userAnswers.get(key).goals) {
          console.log('match');
          player.get(key).team = userAnswers.get(key).goals; 
        }
      }
    }
  }

  useEffect(() => {
    // using setState is kinda async, so need to log out update inside a useEffect
    console.log(statRemove);
  }, [statRemove]);

  useEffect(() => {
    // using setState is kinda async, so need to log out update inside a useEffect
    console.log(userAnswers);
  }, [userAnswers]);

  return (
    <div className='App'>
      <button onClick={() => setStatRemove(quizPlayers)}>see data</button>
      <div className='bg-red-600 flex-col'>
        <form onSubmit={handleSubmit}> 
          {statRemove.map((player: any, i: any) => {
            const [id, stats] = [...player.entries()][0]; // extracting id and data out of each map object
            return (
              <div key={id.toString()} className='flex gap-8'>
                {stats.name === '' ? (
                    <input
                      name={`name-${id}`}
                      className='w-40 bg-slate-400'
                    />
                ) : (
                  <div className='w-40 flex items-center border-s-blue-900'>
                    {stats.name}
                  </div>
                )}
                {stats.nationality === '' ? (
                  <input name={`nationality-${id}`} className='w-40' />
                ) : (
                  <div className='w-40 flex items-center'>
                    {stats.nationality}
                  </div>
                )}

                {stats.team === '' ? (
                  <input name={`team-${id}`} className='w-40' />
                ) : (
                  <div className='w-40 flex items-center'>{stats.team}</div>
                )}

                {stats.goals === 0 ? (
                  <input name={`goals-${id}`} className='w-40' />
                ) : (
                  <div className='w-40 flex items-center'>{stats.goals}</div>
                )}
              </div>
            );
          })}
          <button type='submit'>Submit</button>
        </form>
      </div>
    </div>
  );
}
export default App;
