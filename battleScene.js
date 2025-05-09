const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage
})

let draggle
let emby
let renderedSprites
let battleAnimationId
let queue

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block'
  document.querySelector('#dialogueBox').style.display = 'none'
  document.querySelector('#enemyHealthBar').style.width = '100%'
  document.querySelector('#playerHealthBar').style.width = '100%'
  document.querySelector('#attacksBox').replaceChildren()

  // Set mana awal
  emby = new Monster(monsters.Emby)
  draggle = new Monster(monsters.Draggle)
  emby.currentMana = 100
  draggle.currentMana = 100

  // Update UI Mana bar
  document.querySelector('#playerManaBar').style.width = '100%'
  document.querySelector('#enemyManaBar').style.width = '100%'

  renderedSprites = [draggle, emby]
  queue = []

  emby.attacks.forEach((attack) => {
    const button = document.createElement('button')
    button.innerHTML = attack.name
    document.querySelector('#attacksBox').append(button)
  })

  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]

      // Serangan oleh Emby
      if (selectedAttack.name === 'Fireball') {
        emby.currentMana = Math.max(emby.currentMana - 20, 0)
        gsap.to('#playerManaBar', {
          width: emby.currentMana + '%'
        })
      }

      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites
      })

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint()
        })
        queue.push(() => {
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId)
              animate()
              document.querySelector('#userInterface').style.display = 'none'
              gsap.to('#overlappingDiv', { opacity: 0 })
              battle.initiated = false
              audio.Map.play()
            }
          })
        })
      }

      const randomAttack = draggle.attacks.filter(attack => draggle.currentMana >= 20 || attack.name !== 'Fireball');
      const selectedDraggleAttack = randomAttack[Math.floor(Math.random() * randomAttack.length)];

      queue.push(() => {
        // Serangan oleh Draggle
        if (selectedDraggleAttack.name === 'Fireball') {
          draggle.currentMana = Math.max(draggle.currentMana - 20, 0)
          gsap.to('#enemyManaBar', {
            width: draggle.currentMana + '%'
          })
        }

        draggle.attack({
          attack: selectedDraggleAttack,
          recipient: emby,
          renderedSprites
        })

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint()
          })
          queue.push(() => {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId)
                animate()
                document.querySelector('#userInterface').style.display = 'none'
                gsap.to('#overlappingDiv', { opacity: 0 })
                battle.initiated = false
                audio.Map.play()
              }
            })
          })
        }
      })
    })

    button.addEventListener('mouseenter', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      document.querySelector('#attackType').innerHTML = selectedAttack.type
      document.querySelector('#attackType').style.color = selectedAttack.color
    })
  })
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle)
  battleBackground.draw()

  renderedSprites.forEach((sprite) => {
    sprite.draw()
  })
}

animate()

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  if (queue.length > 0) {
    queue[0]()
    queue.shift()
  } else e.currentTarget.style.display = 'none'
})
