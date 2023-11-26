function main() {
    if (!!document.querySelector('.panel.right.is-home')) {
        document.querySelector('.panel.left').classList.add('is-home')
    } else {
        document.querySelector('.panel.left').classList.remove('is-home')
    }
}
main();
const setup = () => {
    document.addEventListener('swup:page:view', () => {
        main();
    })
}
if (window.swup) {
    setup()
} else {
    document.addEventListener('swup:enable', setup)
}