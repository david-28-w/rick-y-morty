import { Component, OnInit } from '@angular/core';
import { RickAndMortyServiceService } from '../service/rick-and-morty-service.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-rick-and-morty',
  templateUrl: './rick-and-morty.component.html',
  styleUrls: ['./rick-and-morty.component.css']
})
export class RickAndMortyComponent implements OnInit {

  characters: any[] = [];
  selectedCharacter: any = null; // Inicialmente no hay personaje seleccionado
  selectedEpisodes: any[] = [];

  constructor(
    private rickAndMortyService: RickAndMortyServiceService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.rickAndMortyService.getCharacters().subscribe((data: any) => {
      this.characters = data.results;
    });
  }

  // Agrupar personajes de tres en tres
  get groupedCharacters() {
    const groups = [];
    for (let i = 0; i < this.characters.length; i += 3) {
      groups.push(this.characters.slice(i, i + 3));
    }
    return groups;
  }

  onCharacterClick(id: number): void {
    this.http.get(`https://rickandmortyapi.com/api/character/${id}`).subscribe((character: any) => {
      this.selectedCharacter = character; // Guarda el personaje seleccionado
      this.selectedEpisodes = character.episode; // Obtiene las URLs de los episodios
      this.fetchEpisodes(this.selectedEpisodes); // Llama a la función para obtener detalles de episodios
    });
  }

  fetchEpisodes(episodeUrls: string[]) {
    const validUrls = episodeUrls.filter(url => url);

    const episodeRequests = validUrls.map(url => this.http.get(url));

    if (episodeRequests.length > 0) {
      forkJoin(episodeRequests).subscribe({
        next: (episodes: any) => {
          // Aquí asumimos que 'episodes' es un array de objetos de episodio
          this.selectedEpisodes = episodes.map((episode: any) => ({
            name: episode.name,
            season: episode.episode.split('E')[0].replace('S', ''), // Extrae la temporada
            number: episode.episode.split('E')[1] // Extrae el número de episodio
          }));
        },
        error: (err) => {
          console.error('Error al obtener episodios:', err);
        }
      });
    } else {
      this.selectedEpisodes = []; // No hay episodios para mostrar
    }
  }

  goBack(): void {
    this.selectedCharacter = null; // Limpia el personaje seleccionado
    this.selectedEpisodes = []; // Limpia los episodios seleccionados
  }
}
