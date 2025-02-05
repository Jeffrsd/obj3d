document.addEventListener('DOMContentLoaded', function () {
  const track = document.querySelector('.gallery-track');
  const popup = document.getElementById('imagePopup');
  const popupImg = document.getElementById('popupImage');
  const closeBtn = document.querySelector('.popup-close');
  let isMouseDown = false;
  let startX;
  let scrollLeft;
  let currentTranslate = 0;
  let animationPaused = false;

  // Pausa a animação quando o mouse está sobre o carrossel
  track.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
    animationPaused = true;
  });

  // Retoma a animação quando o mouse sai
  track.addEventListener('mouseleave', () => {
    if (!isMouseDown) {
      track.style.animationPlayState = 'running';
      animationPaused = false;
    }
  });

  // Eventos para arrastar o carrossel
  track.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });

  track.addEventListener('mouseleave', () => {
    isMouseDown = false;
    track.style.cursor = 'grab';
  });

  track.addEventListener('mouseup', () => {
    isMouseDown = false;
    track.style.cursor = 'grab';

    // Retoma a animação após soltar
    setTimeout(() => {
      if (!animationPaused) {
        track.style.animationPlayState = 'running';
      }
    }, 50);
  });

  track.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 2;
    currentTranslate = scrollLeft - walk;

    // Atualiza a posição com transform
    track.style.transform = `translateX(${-currentTranslate}px)`;
  });

  // Touch events para dispositivos móveis
  track.addEventListener('touchstart', (e) => {
    isMouseDown = true;
    startX = e.touches[0].pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.style.animationPlayState = 'paused';
  });

  track.addEventListener('touchend', () => {
    isMouseDown = false;
    track.style.animationPlayState = 'running';
  });

  track.addEventListener('touchmove', (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.touches[0].pageX - track.offsetLeft;
    const walk = (x - startX) * 2;
    currentTranslate = scrollLeft - walk;
    track.style.transform = `translateX(${-currentTranslate}px)`;
  });

  // Função para verificar visibilidade e pausar/retomar animação
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        track.style.animationPlayState = 'running';
      } else {
        track.style.animationPlayState = 'paused';
      }
    });
  }, { threshold: 0.5 });

  observer.observe(track);

  // Função para melhorar o looping
  function setupInfiniteLoop() {
    const items = track.children;

    // Clone os primeiros itens e adicione ao final
    for (let i = 0; i < 3; i++) {
      const clone = items[i].cloneNode(true);
      track.appendChild(clone);
    }

    // Ajusta a animação quando chegar ao final
    track.addEventListener('animationend', () => {
      track.style.animation = 'none';
      track.offsetHeight; // Força reflow
      track.style.animation = null;
    });
  }

  // Pop-up de imagem
  const galleryPopup = document.getElementById('imagePopup');
  const galleryItems = document.querySelectorAll('.gallery-item img');
  const popupClose = galleryPopup.querySelector('.popup-close');

  // Adiciona evento de clique em cada imagem da galeria
  galleryItems.forEach(img => {
    img.addEventListener('click', () => {
      popupImg.src = img.src;
      popupImg.alt = img.alt;
      galleryPopup.classList.add('active');
      document.body.style.overflow = 'hidden'; // Previne scroll
    });
  });

  // Fecha o pop-up ao clicar no botão fechar
  popupClose.addEventListener('click', () => {
    galleryPopup.classList.remove('active');
    document.body.style.overflow = ''; // Restaura scroll
  });

  // Fecha o pop-up ao clicar fora da imagem
  galleryPopup.addEventListener('click', (e) => {
    if (e.target === galleryPopup) {
      galleryPopup.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Fecha o pop-up com a tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && galleryPopup.classList.contains('active')) {
      galleryPopup.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Formulário CTA
  const ctaButtons = document.querySelectorAll('.cta-button');
  const formPopup = document.getElementById('ctaForm');
  const formClose = formPopup.querySelector('.form-close');
  const contactForm = document.getElementById('contactForm');

  // Abre o formulário
  ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      formPopup.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Fecha o formulário
  formClose.addEventListener('click', closeForm);
  formPopup.addEventListener('click', (e) => {
    if (e.target === formPopup) {
      closeForm();
    }
  });

  function closeForm() {
    formPopup.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Inicializa o EmailJS com seu Public Key
  emailjs.init("-jpWtcEW06lgQE3eS"); // Substitua com sua chave pública do EmailJS

  // Manipula o envio do formulário
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Mostra indicador de carregamento (opcional)
    const submitButton = this.querySelector('.submit-button');
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;

    // Prepara os parâmetros para o template
    const templateParams = {
      from_name: document.getElementById('name').value,
      from_email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      message: document.getElementById('message').value,
      // Você pode adicionar mais parâmetros conforme necessário
    };

    // Envia o email usando EmailJS
    emailjs.send(
      'service_j36iq3v', // ID do serviço de email
      'template_0gde32w', // ID do template
      templateParams
    )
      .then(function (response) {
        console.log('SUCCESS!', response.status, response.text);
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        contactForm.reset();
        closeForm();
      })
      .catch(function (error) {
        console.log('FAILED...', error);
        alert('Erro ao enviar mensagem. Por favor, tente novamente.');
      })
      .finally(function () {
        // Restaura o botão
        submitButton.textContent = 'Enviar solicitação';
        submitButton.disabled = false;
      });
  });

  // Inicializa as funcionalidades
  setupInfiniteLoop();
});
