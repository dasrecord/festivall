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
  </div>
</template>

<style scoped>
.item {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
}

.details {
  flex: 1;
}

i {
  display: flex;
  place-items: center;
  place-content: center;
  width: 24px;
  height: 24px;
  color: var(--color-text);
}

h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: var(--color-heading);
}

@media (min-width: 1024px) {
  .item {
    margin-top: 0;
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: wrap;
    text-align: left;
    padding-left: 1rem;
    padding-bottom: 2rem;
  }

  i {
    top: calc(50% - 25px);
    left: -26px;
    position: absolute;
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
