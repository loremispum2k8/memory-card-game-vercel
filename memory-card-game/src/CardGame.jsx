import { useState, useEffect, useRef} from 'react'

function CardGame(){
    const loadingRef = useRef()
    const gameContainer = useRef()

    const [dataBase, setDataBase] = useState([]) // All the images

    const [rounds,setRounds] = useState(0)
    const [score, setScore] = useState(0)
    const [bestScore, setBestScore] = useState(localStorage.getItem('bestScore') === null ? localStorage.setItem('bestScore',0) : localStorage.getItem('bestScore'))

    
    useEffect(()=>{
        setBestScore(localStorage.getItem('bestScore'))
    },[rounds])
    

    // Recieve 8 random images, updates when score or bestScore changes
    useEffect(()=>{
        async function recieveGif(){
            const newData = []
            for(let i = 1; i <= 8; i++){
                const newDataObject = {
                    'key': null,
                    'url': null,
                    'isClicked':false
                }

                try {
                    let response  = await fetch("https://dog.ceo/api/breeds/image/random")
                    response = await response.json()
                    response = await response['message']
                    newDataObject['url'] = response
                    newDataObject['key'] = crypto.randomUUID()
                    newData.push(newDataObject)
                }catch(err){
                    console.log(err)
                }
            }
            setTimeout(()=>{
                loadingRef.current.classList.add('loadingDissappearing')
                setTimeout(()=>{
                    loadingRef.current.style.display = 'none'
                },500)
            },400)

            gameContainer.current.classList.remove('loadingDissappearing')
            setTimeout(()=>{
                gameContainer.current.style.display = 'grid'
                gameContainer.current.classList.add('cardsAppearing')
            },400)

            setDataBase(newData)
            console.log(newData)
        }
        recieveGif()
    },[rounds])
    // Recieve 8 random images

    function optainObject(e){
        e.preventDefault()
        e.stopPropagation()

        for(let obj of dataBase){
            if(obj['key'] === e.target.getAttribute('idkey')){
                return obj
            }
        }
    }

    function checkImage(e){
        let obj = optainObject(e)
        if(obj['isClicked']){
            console.log('You lost')
            gameContainer.current.classList.add('loadingDissappearing')
            if(gameContainer.current.classList.contains('cardsAppearing')){
                gameContainer.current.classList.remove('cardsAppearing')
            }
            setTimeout(()=>{
                gameContainer.current.style.display = 'none'
            },600)
            setScore(0)

            //reset
            setTimeout(()=>{
                setRounds(r=>r+1)
            },100)
        }else{
            let resetGame = true

            obj['isClicked'] = true;
            setScore(s=>s+1)

            for(let obj of dataBase){
                if(!obj['isClicked']){
                    resetGame = false;
                }
            }
            if(resetGame){
                console.log('You can reset the game')
                gameContainer.current.classList.add('loadingDissappearing')
                if(gameContainer.current.classList.contains('cardsAppearing')){
                    gameContainer.current.classList.remove('cardsAppearing')
                }
                setTimeout(()=>{
                    gameContainer.current.style.display = 'none'
                },600)

                //reset
                setTimeout(()=>{
                    setRounds(r=>r+1)
                },100)
                if(bestScore <= score){
                    localStorage.setItem('bestScore',score+1)
                    setBestScore(score+1)
                }
            }else{
                console.log('You cannnot reset yet')
                if(bestScore <= score){
                    localStorage.setItem('bestScore',score+1)
                    setBestScore(score+1)
                }
                
                //shuffle
                shuffleImages()
            }

            console.log('Shuffle')
        }
    }

    function shuffleImages(){
        let shuffledArr = [...dataBase];
        for(let i = shuffledArr.length-1; i >= 0; i--){
            let randomIndex = Math.floor(Math.random() * (i+1) )

            let memoryIndex = shuffledArr[i]
            shuffledArr[i] = shuffledArr[randomIndex]
            shuffledArr[randomIndex] = memoryIndex
        }
        setDataBase(shuffledArr)
    }


    useEffect(()=>{
        let cards = document.querySelectorAll('.card')
        let canmove = true;
        let target;
        cards.forEach(card=>{
            card.addEventListener('mouseover',(e)=>{

                cards.forEach(innerCard=>{
                    if(innerCard.getAttribute('idkey') !== e.target.getAttribute('idkey')){
                        innerCard.style.zIndex = '0'
                    }
                })

                target = e.target
                target.style.zIndex = '100'
                canmove  = true;
            })
            card.addEventListener("mousemove",(e)=>{
                if(canmove){
                    e.preventDefault()
                    e.stopImmediatePropagation()
                    e.stopPropagation()
                    let info = e.target.getBoundingClientRect()
                    e.target.style.transform = `rotateY(${(-Math.floor(info.left+(e.target.offsetWidth/2)-e.clientX))/10}deg) 
                    rotateX(${(Math.floor(info.top+(e.target.offsetHeight/2)-e.clientY))/10}deg)`
                }
            })
            card.addEventListener("mouseout",(e)=>{

                cards.forEach(innerCard=>{
                    if(innerCard.getAttribute('idkey') !== target.getAttribute('idkey')){
                        innerCard.style.zIndex = '1'
                    }
                })

                target.setAttribute('style','rotateY(0px) rotateZ(0px)')
                canmove = false;
            })
        })
    })


    return(
        <>  
            <p ref={loadingRef} className='loadingScreen'>Loading...</p>
            <div ref={gameContainer} className='gameContainer'>
                <div className='scoresContainer'>
                    <p>Current score: <b>{score}</b></p>
                    <p>Best score: <b>{bestScore}</b></p>
                </div>
                <div className='cardsContainer'>
                    {dataBase.map((data)=>
                        <img key={data['key']} idkey={data['key']} className='card' src={data['url']} onClick={(e)=>checkImage(e)} alt="" />
                    )}
                </div>
            </div>
        </>
    )

}

export default CardGame
