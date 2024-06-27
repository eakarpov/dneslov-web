export const getItem = async (id: string) => {
    return fetch(`http://185.133.40.112/${id}.json`).then(res => res.json()).catch(e => console.log(e));
};