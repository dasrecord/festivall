<template>
  <div class="item">
    <i>
      <slot name="icon"></slot>
    </i>
    <div class="details">
      <h3>
        <slot name="heading"></slot>
      </h3>
    </div>
    <slot name="description"></slot>
    <div class="logo">
      <slot name="logo"></slot>
    </div>
  </div>
</template>

<style scoped>
.item {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  border: 1px solid rgb(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem 1rem;
}
.item:hover {
  border: 1px solid rgba(255, 255, 255, 0.245.5);
  box-shadow: 0 0 10px 0 rgba(0, 128, 255, 1);
  transition: all 0.3s ease;
}
.details {
  font-size: 20px;
}

i {
  justify-self: center;
  width: 32px;
  height: 32px;
  color: var(--color-text);
}

/* h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: var(--color-heading);
} */

.logo {
  border: none;
  box-shadow: none;
  margin-top: 1rem;
  /* height: 60px; */
}

@media (min-width: 1024px) {
  .item {
    margin-top: 0;
    flex-direction: column;
  }

  i {
    top: calc(50% - 25px);
    left: -26px;

    background: var(--color-background);
    border-radius: 8px;
    width: 24px;
    height: 24px;
  }

  /* .item:before {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    bottom: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:after {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    top: calc(50% + 25px);
    height: calc(50% - 25px);
  } */

  .item:first-of-type:before {
    display: none;
  }

  .item:last-of-type:after {
    display: none;
  }
}
</style>
